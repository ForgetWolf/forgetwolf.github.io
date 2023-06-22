---
title: 瞎折腾，持续更新
date: 2023-05-02 19:54:49
desc: 一些瞎折腾遇到的坑
tags: [笔记]
---

图片唱歌

用人家做好的库跑realtimeimage，结果到最后报错

`from skimage.util import pad`

ImportError: cannot import name 'pad' from 'skimage.util'

哦，skimage更新删掉了pad，~~万恶的skimage~~

于是改成

`from numpy import pad`

ok，又报错了

ImportError: cannot import name 'circle' from 'skimage.draw'

改成

`from skimage.draw import ellipse as circle`

完成。
