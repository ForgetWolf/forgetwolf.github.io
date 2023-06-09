---
title: 深夜随想：脚本与一键工具的利弊
date: 2023-05-02 02:21:06
desc: 这个时代的我们，至少还能清醒的意识到需要保留思考与探究的能力。
tags: [随记]
---

自动与全自动刷机和脚本/工具箱，带来了方便同时降低门槛，点一下就能完成对比疯狂敲代码还担心出错更加简洁高效，但这是有代价的。



代价是得不到任何知识和能力的退化，以及鱼龙混杂。



例如，你会安装Arch 你会用parted分区 你会fastboot flash/boot，但有了工具箱，有了脚本，输入一行代码，甚至只需要操纵鼠标点击一个按钮就好，几秒钟之后就可以去忙自己的事情，忙完之后all done.
而当你失去了工具箱，失去了脚本，你却发现自己什么都不会了。
从不知什么年代的网站下登录后复制的代码，运行失败了你甚至不知道应该复制哪段代码去搜索解决方案，你甚至不知道在哪搜索，因为你从没这么做过。

是的，脚本和工具箱使你什么都没有学到，甚至还退化了。

门槛的降低带来了大量的流量，对于平台是好事，对于用户则是灾难一般的存在
诸多新用户涌入平台，鱼龙混杂且素质有高有低
有人友好提问，你发了一行代码告诉ta这样可以解决，然后有人和你说还不如xx脚本/xx工具箱，甚至还有人在评论区吵架。
问问题不带log，不带报错码，什么都不发或者发个工具箱反馈：xxx失败
但是这压根看不出什么。
我真的很想说，出bug了你不会看log和报错码没问题，在问的时候花几秒钟带上log或报错码，提问或者自己百度下报错码就行。

这样做很难吗？
是，这不难，但是并非所有人不想做。

而是所谓“一键” “工具箱”没有给出，因为它们的开发者觉得这是没有用的，它们的开发者替用户做了选择。
但这样好吗？
好的方面，降低了门槛。
坏的方面，你失去了选择的权利与自由。



**<u>在没有错误日志的情况下诊断任何问题无异于闭眼开车。
----Apache</u>**



这是一个方便人的设定，但方便的背后是失去的权利。其类似于李彦宏所说，中国人愿意用隐私换便利。
诚然，如果一开始就是朝着学习并成为开发者的，是不会用这种东西的。
但是总有人在“玩”过程中发生转变，最终学习并有意无意的向着成为开发者的道路进发。
并且，大多数开发者都是在“玩”的过程中转变来的...一开始能坚持下去的少之又少。
所以，“玩”的过程是非常重要的----哪怕疯狂报错，哪怕令人烦躁，但是不得不承认真的让人学到了很多东西，这也是大部分人走向Developer的路。
虽然很多人中途放弃，但正如鲁迅所写：
“假如一间铁屋子，是绝无窗户而万难破毁的，里面有许多熟睡的人们，不久都要闷死了，然而是从昏睡入死灭，并不感到就死的悲哀。现在你大嚷起来，惊起了较为清醒的几个人，使这不幸的少数者来受无可挽救的临终的苦楚，你倒以为对得起他们么?”

　　**“然而几个人既然起来，你不能说决没有毁坏这铁屋的希望。”**

这种东西直接扼杀了这一条路，扼杀了毁坏这铁屋的希望。
再也没有人需要到处查资料，再也没有的会对着报错无奈，人们只需要按个按钮就行，一秒都不到的过程中间没有人会因为兴趣转变成Developer。
结果就是开发者越来越少，“一键”脚本越来越多，老的开发者离开后进来的只有越来越菜的开发者，因为有了“一键”之后，谁还愿意更新教程？

历史是循环的，“一键”的泡沫破灭后，总是会有小白站出来成为Developer，再次开启一个新的时代，然后循环往复。

但是我们扪心自问，在这些东西占领全部内容，教程再也没有更新后，即使有人想成为Developer，他怎么成为？

当然了，我以上的想法是很偏激，但也不失为一种可能。

自动化是好的，节约了一部分时间。
全自动化，节约了时间，也去掉了在被节约掉的时间里的知识与体验，还有情感。
习惯全自动后，退化就开始了。
而一开始接触到的就是全自动的人，便失去了进化的可能。

所以我鄙视一切自动工具箱的作者，是的，*我从心底看不起您，您在我心中就是一个<u>傻逼</u>*。



但这就是快餐式的本性
快餐式的消费
快餐式的工具
快餐式的人类
快餐式的文化
再也没有深入研究的人，人们只关心自己有没有一样的，只关心结果而不关心过程，这条路的结局就是失去思考与学习的能力，因为走这条路不需要思考更不需要学习。
流量即一切，根本没有人在乎你怎么样，你学到或者失去了什么
他们只关心流量，那个冰冷的数字。

这很悲哀，但这就是摆在我们面前的现实。



作为一个前第三方的kirin处理器机型Developer，我感到很悲哀，很难过。
也许是自娱自乐，也许是这个时代的人真的太快餐。但无论如何我只知道，那种轻松愉快的和相同爱好的人讨论bug，修复方法等的时代，已经一去不复返了，鲜有人愿意按我们复杂的步骤去玩机。

干货永远是小众的，别指望业内人士才能看懂的东西会破圈传播。
好内容想要浏览量，注水稀释是必要且富有技术含量的一环。
可是注水后的东西，还有多少真正的技术？而小众的干货，因为受众太少而成为传说，也可能就发生在明天。

悲哀也好，欢乐也罢，至少中国的出家成为Android Developer的路少了一条。
但我仍庆幸，时至今日还有人能坚持着理想成为了一个合格的Android Developer。



时代的浪潮无法改变，而<u>**这个时代的我们，至少还能清醒的意识到需要保留思考与探究的能力**</u>。



date: 2023-05-02 02:21:0

By Forget.
