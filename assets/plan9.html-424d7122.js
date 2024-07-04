import{_ as i}from"./plugin-vue_export-helper-c27b6911.js";import{r as t,o as d,c as r,a as e,b as n,e as s,f as l}from"./app-a32e01f2.js";const o={},c=l(`<p>在 Go runtime 中存在了大量由 plan9 汇编书写的代码，想要了解 runtime 的实现和机制，掌握 plan9 汇编的基本使用是必须的。(Go 的作者们在选择汇编语言的时候没有选择 intel，也没有选择 AT&amp;T，而是选择了 plan9，哎，一群固执老古董们）。</p><p>plan9 语法虽然与 intel 和 AT&amp;T 略有不同，但整体而言相差不大，如果你之前有其它汇编语言的基本，相信入手也很快。</p><p>下面会介绍一些 plan9 中的常见语法，想要深入了解的可以查看本文的参考资料。</p><h2 id="基本介绍" tabindex="-1"><a class="header-anchor" href="#基本介绍" aria-hidden="true">#</a> 基本介绍</h2><h3 id="寄存器" tabindex="-1"><a class="header-anchor" href="#寄存器" aria-hidden="true">#</a> 寄存器</h3><p>plan9 中对寄存器的命名略有不同，全部大写而且不要前缀，它们之间的对应关系如下：</p><table><thead><tr><th style="text-align:left;">rax</th><th style="text-align:left;">rbx</th><th style="text-align:left;">rcx</th><th style="text-align:left;">rdx</th><th style="text-align:left;">rdi</th><th style="text-align:left;">rsi</th><th style="text-align:left;">rbp</th><th style="text-align:left;">rsp</th><th style="text-align:left;">r8</th><th style="text-align:left;">r9</th><th style="text-align:left;">r10</th><th style="text-align:left;">r11</th><th style="text-align:left;">r12</th><th style="text-align:left;">r13</th><th style="text-align:left;">r14</th><th style="text-align:left;">rip</th></tr></thead><tbody><tr><td style="text-align:left;">AX</td><td style="text-align:left;">BX</td><td style="text-align:left;">CX</td><td style="text-align:left;">DX</td><td style="text-align:left;">DI</td><td style="text-align:left;">SI</td><td style="text-align:left;">BP</td><td style="text-align:left;">SP</td><td style="text-align:left;">R8</td><td style="text-align:left;">R9</td><td style="text-align:left;">R10</td><td style="text-align:left;">R11</td><td style="text-align:left;">R12</td><td style="text-align:left;">R13</td><td style="text-align:left;">R14</td><td style="text-align:left;">PC<br></td></tr></tbody></table><p>表格第一行是通用寄存器的真实名称，第二行是 plan9 中对通用寄存器的称呼。</p><p>除了通用寄存器外，plan9 还定义了几个特殊寄存器来代表一些特殊值，即伪寄存器：</p><ul><li>PC：对应 64 位机中 rip 寄存器，一般称为 ip 寄存器；</li><li>SB：Static Base Pointer 全局静态基地址，一般用来申明全局函数和变量，静态区的首地址；</li><li>SP：Stack Poninter 当前函数调用栈帧基地址，即局部变量的首地址；</li><li>FP：Frame Pointer 帧地址，用来访问函数的参数。</li></ul><h3 id="栈操作" tabindex="-1"><a class="header-anchor" href="#栈操作" aria-hidden="true">#</a> 栈操作</h3><p>plan9 支持 push 和 pop 指令来操作当前调用栈：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>// 分配栈内存，将 AX 中的数据入栈
PUSHQ  AX
// 回收栈内存，将出栈数据拷贝到 AX
POPQ   AX
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>例子：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>MOVQ    $runtime·mainPC(SB), AX // entry 设置程序入口 AX = runtime.main
PUSHQ   AX          // 入栈，传递参数
PUSHQ   $0          // arg size，参数内存大小为 0，第一个参数最后入栈
CALL    runtime·newproc(SB) // 新建 G，来启动 runtime.main，AX 寄存器上存储的是 runtime.main 函数的地址
POPQ    AX   // 两次出栈
POPQ    AX
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这是 runtime 中的一个例子，runtime·newproc 函数通过栈接受两个参数，这里通过 PUSHQ 指令来将两个参数入栈，待调用完毕后，再执行 POPQ 出栈。</p><h3 id="数据移动" tabindex="-1"><a class="header-anchor" href="#数据移动" aria-hidden="true">#</a> 数据移动</h3><p>plan9 使用 MOV 指令来实现数据移动，与 AT&amp;T 类似，MOV 的原数据在左侧，目标地址在右侧，格式如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>MOV SRC DST
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>移动数据的大小由 MOV 指令后缀决定，如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>MOVB $1, DI
MOVQ $-10, AX
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>B 表示移动一个字节，即 byte，Q 表示四个字节，即 4 byte。</p><h3 id="数据计算" tabindex="-1"><a class="header-anchor" href="#数据计算" aria-hidden="true">#</a> 数据计算</h3><p>plan9 支持计算指令直接在寄存器上进行数据操作：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>ADDQ  AX, BX   // BX += AX
SUBQ  AX, BX   // BX -= AX
IMULQ AX, BX   // BX *= AX
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>指令不同的后缀表示操作数据大小，如 Q 表示 4 字节。</p><h3 id="流程跳转" tabindex="-1"><a class="header-anchor" href="#流程跳转" aria-hidden="true">#</a> 流程跳转</h3><p>plan9 支持 JMP 无条件直接跳转，如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>JMP    _rt0_amd64(SB) // 入口
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>当然也支持有条件跳转：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>CMPQ    AX, $0x123 // 比较 AX 与 0x123，如果不等直接 abort
JEQ 2(PC)  // 相等，直接跳过 2 行，到 get_tls
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这个例子中，CMPQ 指令比较 AX 是否与 0x123 相等，如果相等，JEQ 会跳到 PC+2 的指令位置处。</p><h3 id="变量定义" tabindex="-1"><a class="header-anchor" href="#变量定义" aria-hidden="true">#</a> 变量定义</h3><p>在汇编中，变量存储在 .data 和 .rodata 区，其中 .data 区全局可变，如 var 定义的全局变量，而 .rodata 全局不可变，如 const 定义的全局变量。</p><p>plan9 中使用 DATA 结合 GLOBAL 来定义一个变量，基本语法如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>DATA symbol+offset(SB)/width, value
GLOBL ·symbol(SB), [flags,], width
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,36),u=e("li",null,"symbol 表示符号，即变量名称；",-1),p=e("li",null,"offset 表示相对于符号的偏移，即与变量首地址的偏移值；",-1),v=e("li",null,"width 表示变量大小；",-1),m=e("li",null,"value 表示是变量值",-1),g={href:"https://golang.org/doc/asm",target:"_blank",rel:"noopener noreferrer"},h=e("li",null,"SB 是全局变量的首地址，必须加上，其实无实际意义。 举个实际例子：",-1),b=l(`<div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>DATA age+0x00(SB)/4, $25
GLOBL age(SB), RODATA, $4
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这里定义了一个全局变量 age，其大小为 4 字节，值为 25，RODATA 表示 age 只读。 在定义符号变量的时候，offset 一般都是 0，而如果定义数组和字符串，那 offset 就可以为其它值了：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>DATA msg&lt;&gt;+0(SB)/8, $&quot;oh yes i&quot;
DATA msg&lt;&gt;+8(SB)/8, $&quot;am here &quot;
GLOBL msg&lt;&gt;(SB), RODATA, $16
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>&lt;&gt; 是一个特殊符号，表明当前变量只在自己的文件中生效，类似于 C 中的 static。</li><li>msg 大小总共 16，由于是分开定义，所以第一个 offset 是 0，而第二个是 8。</li></ul><h3 id="函数定义" tabindex="-1"><a class="header-anchor" href="#函数定义" aria-hidden="true">#</a> 函数定义</h3><p>函数定义语法如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>TEXT symbol(SB), [flags,] $framesize[-argsize]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>symbol 表示函数名</li><li>flags 标志位</li><li>framesize 函数栈帧大小</li><li>argsize 函数参数大小 以一个简单函数定义为例：</li></ul><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">add</span><span class="token punctuation">(</span>a<span class="token punctuation">,</span> b <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token builtin">int</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>该函数对应的汇编代码如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>TEXT main·add(SB), NOSPLIT, $0-8
    MOVQ a+0(FP), AX
    MOVQ a+8(FP), BX
    ADDQ AX, BX
    MOVQ BX, ret+16(FP)
    RET
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 TEXT 指令来定义函数，对应 ELF 中的 .text 段。add 函数说明如下：</p><ul><li>main 表示包名，add 函数定义在 main 包下</li><li>add 是函数名</li><li>NOSPLIT 表示该函数跳过堆栈溢出的检查</li><li>$0-8 中：0 表示栈帧大小，8 表示返回值大小，即 int 类型大小，很明显由于直接使用寄存器相加，没有局部变量产生，所以栈帧为 0 对于已经定义的函数，可直接通过 CALL 指令来调用，如下：</li></ul><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>CALL  runtime·args(SB)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="小例子" tabindex="-1"><a class="header-anchor" href="#小例子" aria-hidden="true">#</a> 小例子</h2><p>接下来，我们以一个 Hello World 小例子来看看 plan9 汇编是如何使用的(linux 平台下)。项目结构如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>├── go.mod <span class="token comment"># go 模块文件</span>
├── helloworld <span class="token comment"># helloworld 包</span>
│   ├── helloworld.go <span class="token comment"># go 源代码文件</span>
│   └── helloworld.s <span class="token comment"># go 汇编文件</span>
└── main.go <span class="token comment"># main 入口文件</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 Go 中如果需要使用汇编函数，那么需要一个同包同文件名且同名的函数来与之对应，即 helloworld.s 与 helloworld.go 对应。 其中 helloworld.go 文件内容：</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">package</span> helloworld

<span class="token keyword">func</span> <span class="token function">Say</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在文件中声明了一个 Say 函数，但函数却没有函数体，该函数在 helloworld.s 文件中实现。 helloworld.s 文件内容如下：</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>#include &quot;textflag.h&quot;

DATA  msg&lt;&gt;+0x00(SB)/6, $&quot;Hello &quot;
DATA  msg&lt;&gt;+0x06(SB)/6, $&quot;World\\n&quot;
GLOBL msg&lt;&gt;(SB),NOPTR,$12

TEXT ·Say(SB), NOSPLIT, $0
  MOVL    $1, AX          // 在 Go 中 sys_write 系统调用数字编号为  1
  MOVQ    $1, DI          // 第 1 个参数 stdout 编号 1
  LEAQ    msg&lt;&gt;(SB), SI   // 第 2 个参数 msg 指针地址
  MOVL    $12, DX         // 第 3 个参数 count，字符串长度
  SYSCALL                 // 系统调用
  RET
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>结合上面的汇编基本介绍，我们来理一理 plan9 汇编究竟是如何使用的。 代码第 3 ～ 4 行，定义了 msg 变量，即字符串 Hello World\\n。</p><div class="language-s line-numbers-mode" data-ext="s"><pre class="language-s"><code>// 指令  变量名  偏移   长度  字符串内容
   DATA  msg&lt;&gt;+0x00(SB)/6, $&quot;Hello &quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>DATA 用来表示变量，msg 是字符串名称，&lt;&gt; 符号表明 msg 变量仅当前包可用，0x00(SB) 表示变量偏移，这里是 0，而下面是 6，/6 表示字符串长度为 6，DATA 可以分开定义同一个变量，如这里的 msg 变量，被分为了两个部分，注意偏移和长度即可。 代码第 5 行，通过 GLOBL 声明 msg 为全局变量，&lt;&gt; 表示仅在当前包可用，NOPTR 可以不予理会，$12 表示字符串长度。</p><p>代码第 7 行，通过 TEXT 指令来定义函数，注意函数名前面的中点 ·，NOSPLIT 可以不理会，$0 表示返回值大小为 0。</p><p>代码第 8 ～ 13 行，将参数赋值给特定寄存器，然后 SYSCALL 系统调用，注意在 Go 中 sys_write 的编号竟然是 1，而且寄存器的使用也与 C 中不同，笔者一直按照 C 语言的约定来调用，一直失败，后面看了源码以后才恍然大悟。</p><p>最后是入口文件 main.go：</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;passembly/helloworld&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        helloworld<span class="token punctuation">.</span><span class="token function">Say</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>直接运行 main.go 文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ go run main.go 
Hello World
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>看到 Hello World 即代表运行成功。 通过 strace 可以查看一下 Say 函数是否成功调用了 write 系统调用：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ go build main.go
$ <span class="token function">strace</span> ./main

<span class="token punctuation">..</span><span class="token punctuation">..</span>
<span class="token punctuation">..</span><span class="token punctuation">..</span>
write<span class="token punctuation">(</span><span class="token number">1</span>, <span class="token string">&quot;Hello World<span class="token entity" title="\\n">\\n</span>&quot;</span>, 12Hello World
<span class="token punctuation">)</span>           <span class="token operator">=</span> <span class="token number">12</span>
exit_group<span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span>                           <span class="token operator">=</span> ?
+++ exited with <span class="token number">0</span> +++
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过输出可以清晰的看到 Say 函数通过汇编成功的调用了 write 系统调用。</p><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料" aria-hidden="true">#</a> 参考资料</h2>`,34),f={href:"https://golang.org/doc/asm",target:"_blank",rel:"noopener noreferrer"},x={href:"https://xargin.com/plan9-assembly/",target:"_blank",rel:"noopener noreferrer"},k={href:"https://jishuin.proginn.com/p/763bfbd2c39d",target:"_blank",rel:"noopener noreferrer"},A={href:"https://juejin.cn/post/6844903630978416648",target:"_blank",rel:"noopener noreferrer"},y={href:"https://mp.weixin.qq.com/s/B577CdUkWCp_XgUc1VVvSQ",target:"_blank",rel:"noopener noreferrer"};function _(S,B){const a=t("ExternalLinkIcon");return d(),r("div",null,[c,e("ul",null,[u,p,v,m,e("li",null,[n("flags 表示一些标志，如 RODATA 只读，这里不做过多介绍，感兴趣 "),e("a",g,[n("戳这"),s(a)]),n(" 。")]),h]),b,e("ul",null,[e("li",null,[e("a",f,[n("A Quick Guide to Go's Assembler"),s(a)])]),e("li",null,[e("a",x,[n("Go 系列文章 3 ：plan9 汇编入门"),s(a)])]),e("li",null,[e("a",k,[n("汇编是深入理解 Go 的基础 "),s(a)])]),e("li",null,[e("a",A,[n("Go 系列文章 6: syscall"),s(a)])]),e("li",null,[e("a",y,[n("Go 语言汇编入门"),s(a)])])])])}const P=i(o,[["render",_],["__file","plan9.html.vue"]]);export{P as default};