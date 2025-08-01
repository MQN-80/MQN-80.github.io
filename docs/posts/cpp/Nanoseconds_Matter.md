---
icon: edit
title: CppCon2024:Ultrafast Trading Systems in C++
date: 2024-10-10
tag:
  - low latency
  - trading systems
category:
  - cpp
---

# CppCon2024:Ultrafast Trading Systems in C++


本文章是同样对于cppcon24一篇文章的简单复现,原文地址如下[When Nanoseconds Matter](https://cppcon.org/2024grossprerelease/),相关解读如下[Optiver 的 C++ 纳秒优化实战指南](https://zhuanlan.zhihu.com/p/1924997400336000551),本文就是根据原文和解读进行相关复现
## 相关背景
本篇文章讲述了optiver工程师在构建低延时交易系统时的一些方案设计和优化技巧，包括高性能订单薄设计，如何降低网络延迟，基于shared memory的高性能spmc无锁队列，以及统计程序运行中性能指标的的一些benchmark方法，总体讲分享的还是很充实的，本人也是第一次了解交易系统的一些知识，本文主要对一些关键代码的复现，具体细节大家最好还是看原文和油管原视频讲解
## 高性能订单薄设计
首先我们来看optiver工程师是如何设计高性能订单薄的，订单薄作为高频交易中的核心组成，我们可以简单的将其理解为kv序列，k就是价格，v就是对应的一些元素，比如此价格买单卖单的数量，此价格的的订单数量等，如何设计高效的订单薄对于之后的交易模块十分重要。   
首先，对于这种kv数据，我们很自然想到可以用map或者unordered_map来存储订单薄，这里我们以okx提供的接口为例，来展示如何用map来构建订单薄，币圈不同于股票期货这些产品，各大交易所都为开发者提供了免费的接口(免费版有限流)，从而让大家自行构建对应的交易系统，在这里我们选用okx提供的[订单薄接口](https://www.okx.com/docs-v5/zh/#order-book-trading-market-data-ws-order-book-channel),该接口使用websocket来推送订单薄数据，首次会推送深度为400的books，之后每次有更新时推送一次，我们可以在第一次推送时构建map，之后每次推送时更新一次map即可，我们选取监听BTC-USDT，代码如下所示
```cpp
// 需要链接：Boost (Beast, Asio), OpenSSL, nlohmann_json

#include <boost/beast/core.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ssl/error.hpp>
#include <boost/asio/ssl/stream.hpp>
#include <nlohmann/json.hpp>

#include <cstdlib>
#include <iostream>
#include <string>
#include <map>
#include <vector>

namespace beast = boost::beast;
namespace http = beast::http;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = net::ssl;
using tcp = net::ip::tcp;
using json = nlohmann::json;

struct RawLevel {
    double price;
    int32_t size;
    int32_t order_count;
    char data[0];

    RawLevel() = default;
    RawLevel(const json& j) {
        price = std::stod(j[0].get<std::string>());
        size = std::stoi(j[1].get<std::string>());
        order_count = std::stoi(j[2].get<std::string>());
    }
};

using BidLevels = std::map<double, RawLevel, std::greater<>>;
using AskLevels = std::map<double, RawLevel>;

BidLevels bids;  // price descending
AskLevels asks;  // price ascending
uint64_t local_seq = 0;

// Helper: apply update
void apply_update(const json& bids_update, const json& asks_update, uint64_t seq_id) {
    for (const auto& b : bids_update) {
        RawLevel lvl(b);
        double price = lvl.price;
        double qty = lvl.size;
        if (qty == 0.0) bids.erase(price);
        else[[likely]] bids[price] = lvl;
    }
    for (const auto& a : asks_update) {
        RawLevel lvl(a);
        double price = lvl.price;
        double qty = lvl.size;
        if (qty == 0.0) asks.erase(price);
        else[[likely]] asks[price] = lvl;
    }
    local_seq = seq_id;

}

json get_subscribe_msg() {
    return {
        {"id", "ob1"},
        {"op", "subscribe"},
        {"args", {{{"channel", "books"}, {"instId", "BTC-USDT"}}}}
    };
}

int main() {
    try {
        net::io_context ioc;
        ssl::context ctx(ssl::context::tlsv12_client);
        ctx.set_verify_mode(ssl::verify_none);

        tcp::resolver resolver(ioc);
        websocket::stream<beast::ssl_stream<tcp::socket>> ws(ioc, ctx);

        auto results = resolver.resolve("wspap.okx.com", "8443");
        net::connect(ws.next_layer().next_layer(), results.begin(), results.end());

        if (!SSL_set_tlsext_host_name(ws.next_layer().native_handle(), "wspap.okx.com")) {
            beast::error_code ec{static_cast<int>(::ERR_get_error()), net::error::get_ssl_category()};
            throw beast::system_error{ec};
        }

        ws.next_layer().handshake(ssl::stream_base::client);
        ws.handshake("wspap.okx.com", "/ws/v5/public");

        std::cout << "[+] WebSocket connected\n";

        auto sub_msg = get_subscribe_msg().dump();
        ws.write(net::buffer(sub_msg));
        std::cout << "[>] Sent subscription: " << sub_msg << "\n";

        for (;;) {
            beast::flat_buffer buffer;
            ws.read(buffer);
            auto msg = beast::buffers_to_string(buffer.data());
            auto j = json::parse(msg);

            if (j.contains("action") && j["action"] == "snapshot") {
                auto data = j["data"][0];
                bids.clear();
                asks.clear();

                for (auto& b : data["bids"]) {
                    RawLevel lvl(b);
                    bids[lvl.price] = lvl;
                }
                for (auto& a : data["asks"]) {
                    RawLevel lvl(a);
                    asks[lvl.price] = lvl;
                }
                local_seq = data["seqId"].get<uint64_t>();
                std::cout << "[~] Snapshot loaded. Seq: " << local_seq << "\n";

            } else if (j.contains("action") && j["action"] == "update") {
                auto data = j["data"][0];
                uint64_t prev = data["prevSeqId"].get<uint64_t>();
                uint64_t curr = data["seqId"].get<uint64_t>();

                if (prev != local_seq) {
                    std::cerr << "[-] Out-of-sync: expected " << local_seq << ", got " << prev << ". Drop & resync.\n";
                    break;
                }

                apply_update(data["bids"], data["asks"], curr);
                std::cout << "[+] Update applied. Seq: " << curr << ", Spread: ";
                if (!bids.empty() && !asks.empty()) {
                    std::cout << asks.begin()->second.price- bids.begin()->second.price << "\n";
                } else std::cout << "N/A\n";
            }
        }

    } catch (const std::exception& e) {
        std::cerr << "[-] Error: " << e.what() << "\n";
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
```
这里websokcet库我们选择用beast(比较方便,单连接性能也不需要太多),json库选用nlohmann进行解析，这里有几个优化的小技巧，因为订单薄在更新时，一般是修改，而删除和新增价格位相对较少，因此我们可以使用likely来优化分支预测失败的影响   
那么map是否是最优解呢，optiver的工程师在benchmark测试后，发现map节点的内存是离散的，因为数据缓存性的原因，在该场景下性能不如连续存储的vector，因此在高性能场景下选取连续内存的vector更好，在查找数据时使用lower_bound二分查找；但测试后发现lower_bound同样会随机访问内存，作者经过测试后发现顺序查询的效果反而更好，这里我认为是订单薄的depth并不是很深，所以顺序查询反而因为缓存友好占时较少，此前在写多设备数据融合时也发现过这一现象，因此下面给出vector+顺序查询的代码,这里同样有两个小的优化点，一个是likely分支预测，一个是alignas(64)缓存行对齐
```cpp
// 需要链接：Boost (Beast, Asio), OpenSSL, nlohmann_json

#include <boost/beast/core.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/beast/websocket/ssl.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ssl/error.hpp>
#include <boost/asio/ssl/stream.hpp>
#include <nlohmann/json.hpp>

#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include "fastqueue.h"
namespace beast = boost::beast;
namespace http = beast::http;
namespace websocket = beast::websocket;
namespace net = boost::asio;
namespace ssl = net::ssl;
using tcp = net::ip::tcp;
using json = nlohmann::json;

struct alignas(64) RawLevel {
    double price;
    double size;
    int32_t order_count;

    RawLevel() = default;
    RawLevel(const json& j) {
        price = std::stod(j[0].get<std::string>());
        size = std::stod(j[1].get<std::string>());
        order_count = std::stoi(j[3].get<std::string>());
    }

    bool operator<(const RawLevel& other) const { return price < other.price; }
    bool operator>(const RawLevel& other) const { return price > other.price; }
};

std::vector<RawLevel> bids;  // descending
std::vector<RawLevel> asks;  // ascending
uint64_t local_seq = 0;

// Binary search and update
void update_side(std::vector<RawLevel>& book, const json& updates, bool is_bid) {
    std::function<bool(double, double)> cmp_price =
        is_bid ? [](double a, double b) { return a > b; }
               : [](double a, double b) { return a < b; };

    for (const auto& j : updates) {
        RawLevel lvl(j);

        // 顺序查找第一个不小于的位置（即插入点）
        auto it = std::find_if(book.begin(), book.end(), [&](const RawLevel& x) {
            return !cmp_price(x.price, lvl.price);
        });

        if (lvl.size == 0.0) {
            book.erase(it);
        } else [[likely]] {
            if(it != book.end() && it->price == lvl.price) [[likely]]
                *it = lvl;
            else
                book.insert(it, lvl);
        }
    }
}




void apply_update(const json& bids_update, const json& asks_update, uint64_t seq_id) {
    update_side(bids, bids_update, true);
    update_side(asks, asks_update, false);
    local_seq = seq_id;
}

json get_subscribe_msg() {
    return {
        {"id", "ob1"},
        {"op", "subscribe"},
        {"args", {{{"channel", "books"}, {"instId", "BTC-USDT"}}}}
    };
}

int main() {
    try {
        net::io_context ioc;
        ssl::context ctx(ssl::context::tlsv12_client);
        ctx.set_verify_mode(ssl::verify_none);

        tcp::resolver resolver(ioc);
        websocket::stream<beast::ssl_stream<tcp::socket>> ws(ioc, ctx);

        auto results = resolver.resolve("wspap.okx.com", "8443");
        net::connect(ws.next_layer().next_layer(), results.begin(), results.end());

        if (!SSL_set_tlsext_host_name(ws.next_layer().native_handle(), "wspap.okx.com")) {
            beast::error_code ec{static_cast<int>(::ERR_get_error()), net::error::get_ssl_category()};
            throw beast::system_error{ec};
        }

        ws.next_layer().handshake(ssl::stream_base::client);
        ws.handshake("wspap.okx.com", "/ws/v5/public");

        std::cout << "[+] WebSocket connected\n";

        auto sub_msg = get_subscribe_msg().dump();
        ws.write(net::buffer(sub_msg));
        std::cout << "[>] Sent subscription: " << sub_msg << "\n";

        for (;;) {
            beast::flat_buffer buffer;
            ws.read(buffer);
            auto msg = beast::buffers_to_string(buffer.data());
            auto j = json::parse(msg);

            if (j.contains("action") && j["action"] == "snapshot") {
                auto data = j["data"][0];
                bids.clear();
                asks.clear();

                for (auto& b : data["bids"]) bids.emplace_back(b);
                for (auto& a : data["asks"]) asks.emplace_back(a);
                std::sort(bids.begin(), bids.end(), std::greater<>());
                std::sort(asks.begin(), asks.end());
                local_seq = data["seqId"].get<uint64_t>();
                std::cout << "[~] Snapshot loaded. Seq: " << local_seq << "\n";

            } else if (j.contains("action") && j["action"] == "update") {
                auto data = j["data"][0];
                uint64_t prev = data["prevSeqId"].get<uint64_t>();
                uint64_t curr = data["seqId"].get<uint64_t>();

                if (prev != local_seq) {
                    std::cerr << "[-] Out-of-sync: expected " << local_seq << ", got " << prev << ". Drop & resync.\n";
                    break;
                }

                apply_update(data["bids"], data["asks"], curr);
                std::cout << "[+] Update applied. Seq: " << curr << ", Spread: ";
                if (!bids.empty() && !asks.empty()) {
                    std::cout << asks.front().price - bids.front().price << "\n";
                } else std::cout << "N/A\n";
            }
        }

    } catch (const std::exception& e) {
        std::cerr << "[-] Error: " << e.what() << "\n";
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

```

### 基于共享内存的SPMC无锁队列实现
上面的代码只是接收消息后构建订单薄，实际场景中，我们往往需要一个publisher接收消息后，通过跨进程通信将message传递给其他subscriber，这里跨进程通信方式选用最高效的shared memory，作者在这里仍秉持Simplicity is the ultimate sophistication的思想，没有直接使用开源的SPMC库，而是通过两个原子变量来实现无锁，主要的优化点有以下2个:  
1. 变量都做了 CACHE_LINE_SIZE 内存对齐，避免 False Sharing
2. 缓存了写计数器和读计数器，避免对原子变量的频繁读写  

文章中给出示例代码并没有实现shared memory和循环队列，因此我们在文章的基础上还需要实现这两点，完整代码如下：
```cpp
#include <atomic>
#include <cstdint>
#include <cstring>
#include <span>
#include <memory>
#include <cassert>
#include <stdexcept>
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#define CACHE_LINE_SIZE 64
#define Q_WRITE_COUNTER_BLOCK_BYTES 64
#define Q_BLOCK_ALIGNMENT 64
constexpr size_t QUEUE_SIZE = 1024 * 1024; // 1MB 环形缓冲区
template <size_t S, class T>
inline T Align(T value)
{
    return (value + (S - 1)) & (~(S - 1));
}
// 共享内存队列结构体
struct FastQueue {
    alignas(CACHE_LINE_SIZE) std::atomic<uint64_t> mReadCounter{0};
    alignas(CACHE_LINE_SIZE) std::atomic<uint64_t> mWriteCounter{0};
    alignas(CACHE_LINE_SIZE) uint8_t mBuffer[0];
    
    // 创建共享内存队列[3,6](@ref)
    static FastQueue* CreateShared(const char* name) {
        // 计算总大小（结构体+环形缓冲区）
        size_t total_size = sizeof(FastQueue) + QUEUE_SIZE;
        
        // 创建共享内存对象[5,6](@ref)
        int shm_fd = shm_open(name, O_CREAT | O_RDWR, 0666);
        if (shm_fd == -1) throw std::runtime_error("shm_open failed");
        
        // 设置共享内存大小
        if (ftruncate(shm_fd, total_size) == -1) 
            throw std::runtime_error("ftruncate failed");
        
        // 映射共享内存
        void* ptr = mmap(nullptr, total_size, PROT_READ | PROT_WRITE, 
                         MAP_SHARED, shm_fd, 0);
        if (ptr == MAP_FAILED) 
            throw std::runtime_error("mmap failed");
        
        close(shm_fd); // 文件描述符不再需要
        return static_cast<FastQueue*>(ptr);
    }
    
    // 附加到现有共享内存队列
    static FastQueue* AttachShared(const char* name) {
        int shm_fd = shm_open(name, O_RDWR, 0);
        if (shm_fd == -1) throw std::runtime_error("shm_open failed");
        
        struct stat sb;
        if (fstat(shm_fd, &sb) == -1)
            throw std::runtime_error("fstat failed");
        
        void* ptr = mmap(nullptr, sb.st_size, PROT_READ | PROT_WRITE, 
                         MAP_SHARED, shm_fd, 0);
        if (ptr == MAP_FAILED) 
            throw std::runtime_error("mmap failed");
        
        close(shm_fd);
        return static_cast<FastQueue*>(ptr);
    }
    
    // 销毁共享内存队列[6](@ref)
    static void DestroyShared(const char* name, FastQueue* queue) {
        size_t total_size = sizeof(FastQueue) + QUEUE_SIZE;
        munmap(queue, total_size);
        shm_unlink(name);
    }
};
// 生产者（支持环形）
struct QProducer {
    QProducer(FastQueue* mq)
        : mQ(mq),
          mNextElement(mq->mBuffer),
          mBufferStart(mq->mBuffer),
          mBufferEnd(mq->mBuffer + QUEUE_SIZE) {}

    void Write(std::span<const std::byte> buffer) {
        uint32_t size = static_cast<uint32_t>(buffer.size());
        const uint32_t payloadSize = sizeof(uint32_t) + Align<Q_BLOCK_ALIGNMENT>(size);

        // 剩余空间不足则写 wrap 标志（size = 0）
        if (mNextElement + payloadSize > mBufferEnd) {
            uint32_t zero = 0;
            std::memcpy(mNextElement, &zero, sizeof(uint32_t));
            mNextElement = mBufferStart;  // wrap around
        }

        // 写入长度
        std::memcpy(mNextElement, &size, sizeof(uint32_t));
        std::memcpy(mNextElement + sizeof(uint32_t), buffer.data(), size);

        mLocalCounter += payloadSize;
        if (mCachedWriteCounter < mLocalCounter) {
            mCachedWriteCounter = Align<Q_WRITE_COUNTER_BLOCK_BYTES>(mLocalCounter);
            mQ->mWriteCounter.store(mCachedWriteCounter, std::memory_order_release);
        }

        mQ->mReadCounter.store(mLocalCounter, std::memory_order_release);
        mNextElement += payloadSize;

        if (mNextElement >= mBufferEnd)
            mNextElement = mBufferStart;
    }

    uint32_t mLocalCounter{0};
    FastQueue* mQ;
    uint8_t* mNextElement;
    uint8_t* mBufferStart;
    uint8_t* mBufferEnd;
    uint32_t mCachedWriteCounter{0};
};

// 消费者（支持环形）
struct QConsumer {
    QConsumer(FastQueue* mq)
        : mQ(mq),
          mNextElement(mq->mBuffer),
          mBufferStart(mq->mBuffer),
          mBufferEnd(mq->mBuffer + QUEUE_SIZE) {}

    int32_t TryRead(std::span<std::byte> out_buffer) {
        if (mLocalCounter == mCachedReadCounter) {
            mCachedReadCounter = mQ->mReadCounter.load(std::memory_order_acquire);
        }
        if (mLocalCounter == mCachedReadCounter)
            return 0;

        uint32_t size;
        std::memcpy(&size, mNextElement, sizeof(uint32_t));

        if (size == 0) {
            mNextElement = mBufferStart;
            std::memcpy(&size, mNextElement, sizeof(uint32_t));
        }

        if (size > out_buffer.size())
            return -1;

        std::memcpy(out_buffer.data(), mNextElement + sizeof(uint32_t), size);

        uint32_t payloadSize = sizeof(uint32_t) + Align<Q_BLOCK_ALIGNMENT>(size);
        mLocalCounter += payloadSize;
        mNextElement += payloadSize;

        if (mNextElement >= mBufferEnd)
            mNextElement = mBufferStart;

        return static_cast<int32_t>(size);
    }

    uint32_t mLocalCounter{0};
    FastQueue* mQ;
    uint8_t* mNextElement;
    uint8_t* mBufferStart;
    uint8_t* mBufferEnd;
    uint32_t mCachedReadCounter{0};
};
```
我们在这里也给出一个测试demo,当然实际构建交易系统时，我们只需要让consumer接收到update后，将update的json信息作为string publish到spmc，之后consumer接收messsage更新订单薄，并根据相应策略进行下单减仓等操作即可:
```cpp
#include <thread>
#include <vector>
#include <string>
#include <iostream>
#include <chrono>
#include <atomic>
#include "fastqueue.h"  // 假设你已经实现了 FastQueue, QProducer, QConsumer 等

std::atomic<bool> gRunning{true};  // 控制消费者线程是否退出

void ProducerThread(FastQueue* q) {
    QProducer prod(q);
    for (int i = 0; i < 100; ++i) {
        std::string msg = "Message #" + std::to_string(i);
        const std::byte* data = reinterpret_cast<const std::byte*>(msg.data());
        prod.Write(std::span<const std::byte>(data, msg.size()));
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
}

void ConsumerThread(FastQueue* q, int id) {
    QConsumer cons(q);
    std::vector<std::byte> buffer(1024);

    while (gRunning.load()) {
        int32_t n = cons.TryRead(std::span<std::byte>(buffer.data(), buffer.size()));
        if (n > 0) {
            std::string msg(reinterpret_cast<char*>(buffer.data()), n);
            std::cout << "[Consumer " << id << "] Read: " << msg << std::endl;
        } else if (n == 0) {
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
        } else {
            std::cerr << "[Consumer " << id << "] Buffer too small" << std::endl;
        }
    }

    std::cout << "[Consumer " << id << "] Exit.\n";
}

int main() {
    const char* shm_name = "/test_fastqueue";

    // 创建共享内存（生产者进程负责）
    FastQueue* queue = FastQueue::CreateShared(shm_name);

    // 启动生产者线程
    std::thread prod([=]() { ProducerThread(queue); });

    // 启动多个消费者线程
    std::vector<std::thread> consumers;
    for (int i = 0; i < 3; ++i) {
        consumers.emplace_back([=]() {
            FastQueue* q = FastQueue::AttachShared(shm_name);
            ConsumerThread(q, i);
        });
    }

    prod.join();  // 等待生产者完成

    std::this_thread::sleep_for(std::chrono::seconds(5));  // 观察消费过程

    gRunning = false;  // 通知消费者线程退出

    for (auto& t : consumers) {
        t.join();  // 等待消费者线程安全退出
    }

    // 销毁共享内存
    FastQueue::DestroyShared(shm_name, queue);
    return 0;
}

```
### 各级cache影响
最后作者也给出了一个随机访问内存的基准测试程序，展示了 CPU 多级缓存的容量效应和缓存竞争的问题，结论就是当数据能完全放入 L1/L2 Cache时，单核与多核的吞吐量几乎线性扩展；
而当数据集扩大到L3 Cache大小时，多核并行时的总吞吐量显著下降，接近单核吞吐量，这是因为多个核在激烈争抢共享的 L3 Cache，在这里我们也给出该基准测试程序的实现
```cpp
#include <iostream>
#include <vector>
#include <thread>
#include <random>
#include <chrono>
#include <cassert>
#include <algorithm>

// 构造一个大小为 size 字节的跳转链表
std::vector<uint32_t> build_random_link(size_t size_bytes) {
    size_t elem_count = size_bytes / sizeof(uint32_t);
    assert(elem_count > 1);

    std::vector<uint32_t> link(elem_count);
    std::vector<uint32_t> indices(elem_count);
    for (uint32_t i = 0; i < elem_count; i++) indices[i] = i;

    std::random_device rd;
    std::mt19937 g(rd());
    std::shuffle(indices.begin(), indices.end(), g);

    for (size_t i = 0; i < elem_count - 1; i++) {
        link[indices[i]] = indices[i + 1];
    }
    link[indices[elem_count - 1]] = indices[0];

    return link;
}

// 遍历链表 count 次
uint32_t traverse_link(const std::vector<uint32_t>& link, uint64_t count) {
    uint32_t index = 0;
    for (uint64_t i = 0; i < count; i++) {
        index = link[index];
    }
    return index;
}

void worker(size_t data_size_bytes, uint64_t iter_per_thread) {
    auto link = build_random_link(data_size_bytes);
    uint32_t last = traverse_link(link, iter_per_thread);
    // 防止优化
    volatile uint32_t dummy = last;
    (void)dummy;
}

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cout << "Usage: ./cache_test <data_size_in_KB> <thread_count>\n";
        std::cout << "Example: ./cache_test 48 1\n";
        return 1;
    }

    size_t data_size_kb = std::stoul(argv[1]);
    int thread_count = std::stoi(argv[2]);
    size_t data_size_bytes = data_size_kb * 1024;

    std::cout << "Data size per thread: " << data_size_kb << " KB, Threads: " << thread_count << std::endl;

    uint64_t iterations = 100000000ULL / thread_count;

    std::vector<std::thread> threads;


    for (int i = 0; i < thread_count; i++) {
        threads.emplace_back(worker, data_size_bytes, iterations);
    }
    auto start = std::chrono::steady_clock::now();
    for (auto& t : threads) t.join();

    auto end = std::chrono::steady_clock::now();
    std::chrono::duration<double> diff = end - start;

    double total_iters = iterations * thread_count;
    double time_sec = diff.count();
    double throughput = total_iters / time_sec;

    std::cout << "Total iterations: " << total_iters << std::endl;
    std::cout << "Elapsed time: " << time_sec << " s\n";
    std::cout << "Throughput (iterations per second): " << throughput << std::endl;

    return 0;
}
```
我们可以通过./cache_test data_size num_threads这种形式来进行benchmark测试，data_size就是数据大小，num_threads就是启动的线程数，各级cache的大小我们可以通过lscpu命令来获取
### 总结
这是笔者第一次接触低延迟交易系统的设计，主要是学习的过程，可能在代码实现上还有很多不足和没考虑到的地方，原文中还有一些低延时网络部分，因为设备原因没有复现；以及一些性能指标检测的手段，在这里也没有完整给出，建议大家可以阅读原文pdf和视频，会有更深入的理解，less is more的思想值得大家借鉴。