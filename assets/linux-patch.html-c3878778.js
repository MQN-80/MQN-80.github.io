const e=JSON.parse('{"key":"v-474157c0","path":"/posts/os/linux-patch.html","title":"带你修改一次 Linux 内核","lang":"zh-CN","frontmatter":{"icon":"edit","title":"带你修改一次 Linux 内核","date":"2022-07-22T00:00:00.000Z","tag":["os","linux"],"category":["os"],"description":"使用 运行容器： $ git clone https://github.com/pedrogao/qemu-linux $ cd qemu-linux &amp;&amp; docker build . -t qemu-linux $ docker run -it qemu-linux /bin/bash","head":[["meta",{"property":"og:url","content":"https://mqn-80.github.io/posts/os/linux-patch.html"}],["meta",{"property":"og:site_name","content":"梦秋年"}],["meta",{"property":"og:title","content":"带你修改一次 Linux 内核"}],["meta",{"property":"og:description","content":"使用 运行容器： $ git clone https://github.com/pedrogao/qemu-linux $ cd qemu-linux &amp;&amp; docker build . -t qemu-linux $ docker run -it qemu-linux /bin/bash"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-04T03:07:37.000Z"}],["meta",{"property":"article:author","content":"MQN-80"}],["meta",{"property":"article:tag","content":"os"}],["meta",{"property":"article:tag","content":"linux"}],["meta",{"property":"article:published_time","content":"2022-07-22T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-04T03:07:37.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"带你修改一次 Linux 内核\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-07-22T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-04T03:07:37.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"MQN-80\\",\\"url\\":\\"https://github.com/MQN-80\\"}]}"]]},"headers":[{"level":2,"title":"使用","slug":"使用","link":"#使用","children":[]},{"level":2,"title":"环境搭建","slug":"环境搭建","link":"#环境搭建","children":[]},{"level":2,"title":"Crosstool-ng","slug":"crosstool-ng","link":"#crosstool-ng","children":[]},{"level":2,"title":"Buildroot","slug":"buildroot","link":"#buildroot","children":[]},{"level":2,"title":"修改源代码","slug":"修改源代码","link":"#修改源代码","children":[]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{"createdTime":1720061552000,"updatedTime":1720062457000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":2}]},"readingTime":{"minutes":87.03,"words":26110},"filePathRelative":"posts/os/linux-patch.md","localizedDate":"2022年7月22日","excerpt":"<h2> 使用</h2>\\n<p>运行容器：</p>\\n<div class=\\"language-bash line-numbers-mode\\" data-ext=\\"sh\\"><pre class=\\"language-bash\\"><code>$ <span class=\\"token function\\">git</span> clone https://github.com/pedrogao/qemu-linux\\n$ <span class=\\"token builtin class-name\\">cd</span> qemu-linux <span class=\\"token operator\\">&amp;&amp;</span> <span class=\\"token function\\">docker</span> build <span class=\\"token builtin class-name\\">.</span> <span class=\\"token parameter variable\\">-t</span> qemu-linux\\n$ <span class=\\"token function\\">docker</span> run <span class=\\"token parameter variable\\">-it</span> qemu-linux /bin/bash\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div>","autoDesc":true}');export{e as data};