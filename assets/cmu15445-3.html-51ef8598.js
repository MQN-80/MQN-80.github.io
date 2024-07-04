const e=JSON.parse('{"key":"v-36ab70ee","path":"/posts/database/cmu15445-3.html","title":"谈谈关系数据库的设计与实现(3)——并发B+树","lang":"zh-CN","frontmatter":{"icon":"edit","title":"谈谈关系数据库的设计与实现(3)——并发B+树","date":"2023-04-22T00:00:00.000Z","tag":["sql","database","oltp"],"category":["database"],"description":"并发 B+树 主流关系数据库(如 MySQL、PostgreSQL 等)在数据组织和索引组织上几乎都选择了 B+树或其变种。B+树在关系数据库上的重要性不言而喻，这里我们先简单的来介绍一下 B+树 。 B+树定义 B+树是一种多路自平衡树，不同于二叉树，B+树可以拥有多个子节点，并且能够一直保持完美的自平衡。一颗 B+树包括根节点、内部节点、叶子节点三种节点，根节点既可以是内部节点，也可以作为叶子节点。如下图 4 所示：","head":[["meta",{"property":"og:url","content":"https://mqn-80.github.io/posts/database/cmu15445-3.html"}],["meta",{"property":"og:site_name","content":"梦秋年"}],["meta",{"property":"og:title","content":"谈谈关系数据库的设计与实现(3)——并发B+树"}],["meta",{"property":"og:description","content":"并发 B+树 主流关系数据库(如 MySQL、PostgreSQL 等)在数据组织和索引组织上几乎都选择了 B+树或其变种。B+树在关系数据库上的重要性不言而喻，这里我们先简单的来介绍一下 B+树 。 B+树定义 B+树是一种多路自平衡树，不同于二叉树，B+树可以拥有多个子节点，并且能够一直保持完美的自平衡。一颗 B+树包括根节点、内部节点、叶子节点三种节点，根节点既可以是内部节点，也可以作为叶子节点。如下图 4 所示："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-04T02:52:32.000Z"}],["meta",{"property":"article:author","content":"MQN-80"}],["meta",{"property":"article:tag","content":"sql"}],["meta",{"property":"article:tag","content":"database"}],["meta",{"property":"article:tag","content":"oltp"}],["meta",{"property":"article:published_time","content":"2023-04-22T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-04T02:52:32.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"谈谈关系数据库的设计与实现(3)——并发B+树\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-04-22T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-04T02:52:32.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"MQN-80\\",\\"url\\":\\"https://github.com/MQN-80\\"}]}"]]},"headers":[{"level":2,"title":"并发 B+树","slug":"并发-b-树","link":"#并发-b-树","children":[{"level":3,"title":"B+树定义","slug":"b-树定义","link":"#b-树定义","children":[]},{"level":3,"title":"B+树设计","slug":"b-树设计","link":"#b-树设计","children":[]},{"level":3,"title":"B+树搜索","slug":"b-树搜索","link":"#b-树搜索","children":[]},{"level":3,"title":"B+树插入","slug":"b-树插入","link":"#b-树插入","children":[]},{"level":3,"title":"B+树删除","slug":"b-树删除","link":"#b-树删除","children":[]},{"level":3,"title":"Crabbing 协议","slug":"crabbing-协议","link":"#crabbing-协议","children":[]},{"level":3,"title":"小结","slug":"小结","link":"#小结","children":[]},{"level":3,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}]}],"git":{"createdTime":1720061552000,"updatedTime":1720061552000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":1}]},"readingTime":{"minutes":97.54,"words":29262},"filePathRelative":"posts/database/cmu15445-3.md","localizedDate":"2023年4月22日","excerpt":"<h2> 并发 B+树</h2>\\n<p>主流关系数据库(如 MySQL、PostgreSQL 等)在数据组织和索引组织上几乎都选择了 B+树或其变种。B+树在关系数据库上的重要性不言而喻，这里我们先简单的来介绍一下 <a href=\\"https://en.wikipedia.org/wiki/B%2B_tree\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">B+树</a> 。</p>\\n<h3> B+树定义</h3>\\n<p>B+树是一种多路自平衡树，不同于二叉树，B+树可以拥有多个子节点，并且能够一直保持完美的自平衡。一颗 B+树包括根节点、内部节点、叶子节点三种节点，根节点既可以是内部节点，也可以作为叶子节点。如下图 4 所示：</p>","autoDesc":true}');export{e as data};
