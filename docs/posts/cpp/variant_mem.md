---
icon: edit
title: CppCon2024:Designing a Slimmer Vector of Variants
date: 2024-10-10
tag:
  - memory variant
category:
  - cpp
---

# CppCon2024: Designing a Slimmer Vector of Variants

<!-- <embed src="/imgs/谈谈在线表格协同方案.pdf" type="application/pdf" width="1200" height="1200" > -->

本文章是对于cppcon24一篇文章的简单复现,原文地址如下[Designing a Slimmer Vector of Variants](https://schedule.cppnow.org/wp-content/uploads/2024/02/Designing_a_Slimmer_Vector_of_Variants_-_CNow.pdf),相关解读如下[cppcon24解读:设计一个紧凑的Vector of Variants](https://zhuanlan.zhihu.com/p/1923145557515412512),本文就是根据原文和解读进行相关复现
## solution-origin:原始解决方案
首先最直观的方案就是直接用vector存储variant,但我们要注意每个variant的大小都是取所有类型中最大类型的尺寸,因此这样存储会带来巨大的内存开销，尤其是在内部有类型长度过长的情况下，比如demo中的char[5000],我们可以给出代码示例如下:
```cpp
struct big_data{
    char data[5000];
};
void solution_origin(){
    std::cout<<"solution origin解决方案"<<std::endl;
    using complex_type=std::variant<int,bool,double,std::string,big_data>;
    std::vector<complex_type>stos{1,true,1.0,"ssss"};
    std::cout<<"vector附加信息大小"<<sizeof(stos)<<std::endl;
    std::cout<<"vector存储信息大小"<<stos.size()*sizeof(stos[0])<<std::endl;
}
```
从输出结果我们可以看出vector本身的内存占用是24字节，包含存储容量(8字节)，存储个数(8字节)，数组指针(8字节)；而存储信息大小为(5000+8)*4=20032字节，5000是最大类型char[5000]的长度，而8是variant类型的索引信息
## solution1:用指针存储
因为variant大小取决于最大类型的长度，因此我们自然想到，假如存储指针的话，则最大长度就是指针长度8，从而减少很多无效的内存占用，其代码如下:
```cpp
void solution1(){
    std::cout<<"solution 1解决方案"<<std::endl;
    using complex_type=std::variant<int*,bool*,double*,std::string*,big_data*>;
    std::vector<complex_type>stos{new int(1),new bool(true),new double(1.2),new std::string("three")};
    std::cout<<"vector附加信息大小"<<sizeof(stos)<<std::endl;
    //std::cout<<*std::get<int*>(stos[0]);
    std::cout<<"vector指针大小"<<stos.size()*sizeof(stos[0])<<std::endl;
    std::cout<<"vector存储信息大小"<<sizeof(bool)+sizeof(int)+sizeof(double)+sizeof(*std::get<std::string*>(stos[3]))<<std::endl;
}
```
从输出结果我们可以看出减少了很多空间占用，vector存储指针大小为4*(8+8)=64字节，而对象存储占用空间大小为(1+4+8+32)=45字节，字符串为32字节是因为这里默认使用sso短字符串优化，内存总占用为24+54+45=133字节  
虽然我们减少了内存占用，但这样做还是有很多不足之处，最明显的就是内存碎片化，对访存不友好，且每次需要申请和释放内存，因此我们需要进一步改进
## solution2:pmr+指针改进
上面说到直接用裸指针需要每次都申请内存，因此我们用placement new的方法来实现内存池，在这里我们用pmr申请一块56字节大小的缓冲区(4+4+8+40)，字符串变为40字节是因为我们这里使用的是std::pmr::string，元信息中多了一个指针，当然我们也可以吧vector放到buffer里，但是我们预先用resize的话，也不用申请内存，并且实践发现两者都放到buffer里内存占用会增加?..
```cpp
void solution2() {
    std::cout << "solution2解决方案\n";
    std::array<std::byte, 56> buffer;
    std::pmr::monotonic_buffer_resource pool(buffer.data(), buffer.size(),nullptr);
  
    using big_data = std::pmr::vector<char>;  // pmr大数据结构
    using str_type = std::pmr::string;

    using complex_type = std::variant<bool*,int*, double*, str_type*, big_data*>;

    std::vector<complex_type> vec; 
    vec.reserve(4);  //resize到4提前扩容
    bool* pb=new (pool.allocate(sizeof(bool),alignof(bool))) bool(true);
    //分配空间并 placement new 构造
    int* pi = new (pool.allocate(sizeof(int), alignof(int))) int(42);
    double* pd = new (pool.allocate(sizeof(double), alignof(double))) double(3.14);
    str_type* ps = new (pool.allocate(sizeof(str_type), alignof(str_type))) str_type("three");
    //std::cout<<sizeof(*ps);
    vec.emplace_back(pb);
    vec.emplace_back(pi);
    vec.emplace_back(pd);
    vec.emplace_back(ps);
    std::cout<<"vector附加信息大小"<<sizeof(vec)<<std::endl;
    std::cout<<"vector指针大小"<<vec.size()*sizeof(vec[0])<<std::endl;
    std::cout<<"vector存储信息大小"<<buffer.size()<<std::endl;

    // ❗无需 delete，内存随 pool 一起释放
}
```
改进后总内存占用为24+64+56=144字节，多出的字节是pmr的开销，当然我们也可以直接placement new来节省这个开销，但pmr的主要作用是避免频繁动态申请内存，为了更方便的查看运行过程中是否有动态内存申请，我们也可以简单的通过下面这个函数来打印:
```cpp
#include<new>
void* operator new(std::size_t size) {
    std::cout << "[!] global new called with size " << size << "\n";
    return malloc(size);
}

void operator delete(void* ptr) noexcept {
    std::cout << "[!] global delete called\n";
    free(ptr);
}
```
## solution3:手动实现内存友好的vector
根据原pdf的指引，最终想要实现一个缓存友好，防止数据存储碎片化问题，且保证内存占用不会过高问题的vector，我们参考原文，通过offsets，types，data三个数组来实现该功能，具体代码如下:
```cpp
// 获取类型索引
template <typename T, typename... Ts>
constexpr std::size_t type_index() {
    return std::variant<Ts...>(std::in_place_type<T>).index();
}

template <typename... Ts>
class HeteroVector {
public:
    using VariantType = std::variant<Ts...>;

    HeteroVector() = default;
    ~HeteroVector() {
        clear();
    }

    template <typename T>
    void push_back(const T& value) {
        static_assert((std::is_same_v<T, Ts> || ...), "Type not in variant");
        size_t tidx = type_index<T, Ts...>();

        size_t align = alignof(T);
        size_t size = sizeof(T);
        // resize 提前扩容足够空间,可能有一些空的
        size_t reserve_size = current_offset_ + align + size;
        data_.resize(reserve_size);
        // std::cout<<current_offset_<<" "<<align<<" "<<size<<std::endl;
        void* raw_ptr = data_.data() + current_offset_;
        size_t space = reserve_size - current_offset_;  // 更新 space AFTER resize
        //找到对齐后的指针位置
        void* aligned_ptr = std::align(align, size, raw_ptr, space);
        assert(aligned_ptr != nullptr);  // 如果空间足够，这里就不会失败

        T* obj = new (aligned_ptr) T(value);

        size_t new_offset = reinterpret_cast<uint8_t*>(aligned_ptr) - data_.data();
        offsets_.push_back(new_offset);
        type_indices_.push_back(static_cast<uint8_t>(tidx));

        current_offset_ = new_offset + size;
    }


    VariantType get(size_t index) const {
        assert(index < offsets_.size());
        size_t offset = offsets_[index];
        uint8_t type_id = type_indices_[index];

        return get_impl(type_id, offset);
    }

    size_t size() const { return offsets_.size(); }

    void clear() {
        for (size_t i = 0; i < size(); ++i) {
            size_t offset = offsets_[i];
            uint8_t tid = type_indices_[i];
            destroy_impl(tid, offset);
        }
        offsets_.clear();
        type_indices_.clear();
        data_.clear();
        current_offset_ = 0;
    }
    void printMemory() {
        std::cout << "========== HeteroVector Memory Layout ==========\n";
        std::cout << "Total buffer size: " << data_.size() << " B\n";
        std::cout << "Current offset (used): " << offsets_.size()*sizeof(size_t) << " B\n";
        std::cout << "type_indices_:"<<sizeof(type_indices_)<<" B\n";
        //std::cout << "Allocated object count: " << offsets_.size() << "\n\n";

        for (size_t i = 0; i < offsets_.size(); ++i) {
            size_t offset = offsets_[i];
            uint8_t tid = type_indices_[i];

            std::cout << "Index " << i << ": ";
            std::visit([](const auto& v) {
                using T = std::decay_t<decltype(v)>;
                std::cout << "Type = " << typeid(T).name()
                        << ", Size = " << sizeof(T)
                        << ", Value = " << v;
            }, get(i));

            std::cout << ", Offset = " << offset
                    << ", Aligned Address = " << static_cast<void*>(&data_[offset])
                    << "\n";
        }

        std::cout << "===============================================\n";
    }


private:
    std::vector<uint8_t> data_;
    std::vector<size_t> offsets_;
    std::vector<uint8_t> type_indices_;
    size_t current_offset_ = 0;

    // ========== 类型辅助函数 ==========
    template <typename T>
    VariantType wrap_variant(void* ptr) const {
        return VariantType(*reinterpret_cast<T*>(ptr));
    }

    VariantType get_impl(uint8_t tid, size_t offset) const {
        return get_from_table(tid, offset, std::index_sequence_for<Ts...>{});
    }

    template <std::size_t... Is>
    VariantType get_from_table(uint8_t tid, size_t offset, std::index_sequence<Is...>) const {
        using Func = VariantType(HeteroVector::*)(size_t) const;
        static constexpr Func jump_table[] = {
            &HeteroVector::template get_as<Ts>...
        };
        return (this->*jump_table[tid])(offset);
    }

    template <typename T>
    VariantType get_as(size_t offset) const {
        return VariantType(*reinterpret_cast<const T*>(&data_[offset]));
    }

    void destroy_impl(uint8_t tid, size_t offset) {
        destroy_from_table(tid, offset, std::index_sequence_for<Ts...>{});
    }

    template <std::size_t... Is>
    void destroy_from_table(uint8_t tid, size_t offset, std::index_sequence<Is...>) {
        using Func = void(HeteroVector::*)(size_t);
        static constexpr Func destroyers[] = {
            &HeteroVector::template destroy<Ts>...
        };
        (this->*destroyers[tid])(offset);
    }

    template <typename T>
    void destroy(size_t offset) {
        reinterpret_cast<T*>(&data_[offset])->~T();
    }
};
void solution3(){
    std::cout<<"solution3"<<std::endl;
    HeteroVector<bool, int, double, std::string> vec;
    vec.push_back(true);
    vec.push_back(123);
    vec.push_back(3.14);
    vec.push_back(std::string("hello"));
    // for (size_t i = 0; i < vec.size(); ++i) {
    //     std::visit([](auto&& v) { std::cout << v << "\n"; }, vec.get(i));
    // }
    vec.printMemory();

}
```
通过模版来实现对vec的访问，根据索引来获取偏移量，从uint8数组中直接获取对应值，并且存储数据的data数组是连续内存  
通过align来进行数据对齐避免访问时出错，假如我们知道要可能要存储的数据大小，我们也可以直接reverse data数组来避免多次扩容的性能损失