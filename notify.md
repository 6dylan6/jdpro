	
# 1. 注意事项: 
（1）如果发现账户名称不能被正确处理，请手动删除ql\scripts\CKName_cache.json 文件.
	
（2）另外某些账号如果服务器返回空有可能不会被正确处理，请知悉.

（3）ql.js 是jd_CheckCK.js和sendNotify.js的依赖,	只要你使用了这两个脚本就一定保证放在同个文件夹里面.
	
（4）使用Ninjia要注意Extra.sh中把 cp sendNotify.js /ql/scripts/sendNotify.js 这一句删除，不然每次重启容器sendNotify.js都会被覆盖.
  
（5）如果用不同的通知类型分组，比如TG作为组1，企业微信作为组2，且之前已经设置过企业微信通知的参数QYWX_AM，请先将QYWX_AM置空（export QYWX_AM=""），再设置组2的企业微信参数QYWX_AM2（export QYWX_AM2="abcdef"）。否则原有的QYWX_AM参数仍在生效中，导致企业微信仍然接受到组1的通知.(来自Windstill的惨痛经历)

# 2. 关于群组
原通知配置变量加上数字，组成新的通知群组.通知脚本目前支援5组变量.

例子:企业微信配置了QYWX_AM和QYWX_AM2,兑换通知时推送到的QYWX_AM2配置的企业微信.即群组2.
	
(PS:例子使用了企业微信的变量QYWX_AM,实际是所有推送变量后加数字都会有效.)

# 3. jd_bean_change.js (已添加支持一对一推送)
京东资产变动 + 白嫖榜 + 京东月资产变动,注意事项: 

	如果你遇到TG Bark报错，那是因为报文过长，请使用分段通知功能.
	
	CKName_cache.json 跟 CK_WxPusherUid.json 现在写死路径到ql/scripts

变量列表:

    (1) EANCHANGE_PERSENT  分段通知	
        例子 :  export BEANCHANGE_PERSENT="10"  	
	    总共有22个账号,结果会分成3条推送通知，1~10为第一条推送，11~20为第二条推送，剩余的为第三条推送
    
    (2) BEANCHANGE_USERGP2 BEANCHANGE_USERGP3 BEANCHANGE_USERGP4  根据Pt_Pin的值进行分组通知
        注意：分组通知会强制禁用BEANCHANGE_PERSENT变量!	
	    分组通知的通知标题为 脚本名+"#"+分组数值
	    主要用于搭配通知脚本的分组通知使用.
    
    (3) BEANCHANGE_ENABLEMONTH (此功能已永久停用)
        每月1号17点后如果执行资产查询，开启京东月资产变动的统计和推送.	
	    拆分通知和分组通知的变量都可以兼容.	
	    标题按照分组分别为 京东月资产变动 京东月资产变动#2 京东月资产变动#3 京东月资产变动#4	
	    开启 :  export BEANCHANGE_ENABLEMONTH="true"  	
    
    (4) BEANCHANGE_ALLNOTIFY
		设置推送置顶公告，公告会出现在资产通知中(包括一对一),支持html语法.
		例子 :  export BEANCHANGE_ALLNOTIFY='ccwav 虽然头发块掉光了
		可是还是很帅啊...
		
		不说了，我去哭会....'  
		
		显示效果:
		
		【✨✨✨✨公告✨✨✨✨】
		 ccwav 虽然头发块掉光了
		 可是还是很帅啊...
		 
		 不说了，我去哭会.... 
	
	(5) BEANCHANGE_ExJxBeans
		当设定BEANCHANGE_ExJxBeans="true"且时间在17点之后，会自动将临期京豆兑换成喜豆续命.

	(6) BEANCHANGE_DISABLELIST
		关闭查询列表中的项目,自行删减.(攻略显示就是之前的提醒)
		export BEANCHANGE_DISABLELIST="汪汪乐园&京东赚赚&京东秒杀&东东农场&极速金币&京喜牧场&京喜工厂&京东工厂&领现金&喜豆查询&金融养猪&东东萌宠&活动攻略"
		

  
# 4. sendNotify.js
发送通知脚本Pro.

集成自动禁用失效CK功能，当NOTIFY_AUTOCHECKCK=“true”时开启,默认关闭,原理是通过捕获任务脚本发送ck失效实现，

精准操作，支持一对一推送，通知标题还是以前的"京东CK检测",兼容jd_CheckCK.js的分组设定和CHECKCK_ALLNOTIFY设定.

变量列表:

    (1) NOTIFY_SKIP_LIST
    如果通知标题在此变量里面存在(&隔开),则用屏蔽不发送通知.(PS: Ningjia 作者写的功能，继承过来.)	
    例子 :  export NOTIFY_SKIP_LIST="京东CK检测&京东资产变动"
    
    (2) NOTIFY_GROUP2_LIST NOTIFY_GROUP3_LIST NOTIFY_GROUP4_LIST NOTIFY_GROUP5_LIST NOTIFY_GROUP6_LIST
    如果通知标题在此变量里面存在(&隔开),则用第2/3/4/5/6套推送变量进行配置.
    
    (3) NOTIFY_SHOWNAMETYPE
    export NOTIFY_SHOWNAMETYPE="1"    不做任何变动
    export NOTIFY_SHOWNAMETYPE="2"    效果是 :  账号名称：别名(备注)	
    export NOTIFY_SHOWNAMETYPE="3"    效果是 :  账号名称：pin(备注)
    export NOTIFY_SHOWNAMETYPE="4"    效果是 :  账号名称：备注
    
    (4) NOTIFY_SKIP_NAMETYPELIST
    单独指定某些脚本不做NOTIFY_SHOWNAMETYPE变量处理
	  例子 :  export NOTIFY_SKIP_NAMETYPELIST="东东农场&东东工厂"
    
    (5) 特殊标题控制，可以自行加载到第二点的变量中控制
    东东农场领取 东东萌宠领取 京喜工厂领取 汪汪乐园养joy领取 脚本任务更新
    
    (6) NOTIFY_NOREMIND
    对 东东农场领取 东东萌宠领取 京喜工厂领取 汪汪乐园养joy领取 脚本任务更新的通知进行屏蔽,可自行删减.	
    export NOTIFY_NOREMIND="京喜工厂领取&汪汪乐园养joy领取"
    
    (7) NOTIFY_NOCKFALSE
    屏蔽任务脚本的ck失效通知
    export NOTIFY_NOCKFALSE="true"
    
    (8) NOTIFY_AUTHOR
    指定通知底部显示 本通知 By 后面显示的字符,默认是ccwav Mod
    
    (9) NOTIFY_NOLOGINSUCCESS
    屏蔽青龙登陆成功通知，登陆失败不屏蔽(新版貌似可以直接设定了)
    export NOTIFY_NOLOGINSUCCESS="true" 
    
    (10) NOTIFY_CUSTOMNOTIFY
    强大的自定义通知，格式为 脚本名称&推送组别&推送类型 (推送组别总共5组)
    推送类型: Server酱&pushplus&pushplushxtrip&Bark&TG机器人&钉钉&企业微信机器人&企业微信应用消息&iGotNotify&gobotNotify&WxPusher
    export NOTIFY_CUSTOMNOTIFY=["京东资产变动&组1&Server酱&Bark&企业微信应用消息","京东白嫖榜&组2&钉钉&pushplus"] 
    
    (11) NOTIFY_CKTASK
    当接收到发送CK失效通知和Ninja 运行通知时候执行子线程任务,支持js py ts 
    例子: export NOTIFY_CKTASK="jd_CheckCK.js"
	
	(12) PUSH_PLUS_TOKEN_hxtrip 和 PUSH_PLUS_USER_hxtrip
    增加pushplus.hxtrip.com的推送加接口，貌似更稳定,注意这个和PUSHPLUS不是同一家.
    
	(13) 用 WxPusher 进行一对一推送
	新方案;
	填写变量 WP_APP_TOKEN_ONE,按照备注内容@@WxPusherUid的格式修改备注,例子 萌新cc@@UID_AASDADASDQWEQWDADASDADASDASDSA
	旧方案:
	详细教程有人写了，不知道是幸运还是不幸: https://www.kejiwanjia.com/jiaocheng/27909.html
	填写变量 WP_APP_TOKEN_ONE,可在管理台查看: https://wxpusher.zjiecode.com/admin/main/app/appToken
	手动建立CK_WxPusherUid.json，放通知脚本同级文件夹,可以参考CKName_cache.json,只是nickName改成Uid，
	每个用户的uid可在管理台查看: https://wxpusher.zjiecode.com/admin/main/wxuser/list	
	CK_WxPusherUid.json 内容(pt_pin 如果是汉字需要填写转码后的!):
	[
	  {
		"pt_pin": "ccwav",
		"Uid": "UID_AAAAAAAA"
	  },
	  {
		"pt_pin": "中文名",
		"Uid": "BBBBBBBBBB"
	  }
	]
	
	(14) NOTIFY_SKIP_TEXT
    如果此变量(&隔开)的关键字在通知内容里面存在,则屏蔽不发送通知.
    例子 :  export NOTIFY_SKIP_TEXT="忘了种植&异常"
    
	(15) NOTIFY_AUTHOR_BLANK (tcbaby提交)
    控制不显示推送通知的底部信息
    例子 :  export NOTIFY_AUTHOR_BLANK="随便填只要非空即可"
	



# 分组应用总结实例:

    ##CK失效时执行脚本
    export NOTIFY_CKTASK="ccwav_QLScript2_jd_CheckCK.js"

    ##开启月结资产推送
    export BEANCHANGE_ENABLEMONTH="true"

    ##分组2推送    
    export QYWX_AM2=""
    export PUSH_PLUS_TOKEN2="ABCDEFGHIJKLMN"
    export PUSH_PLUS_USER2="Group2";
    export BEANCHANGE_USERGP2="账号1pin&账号5pin&账号8pin"
    export NOTIFY_GROUP2_LIST="京东资产变动#2&京东白嫖榜#2&京东月资产变动#2&省钱大赢家之翻翻乐#2&京东CK检测#2"
    
    ##分组3推送
    export QYWX_AM3=""
    export PUSH_PLUS_TOKEN3="ABCDEFGHIJKLMN"
    export PUSH_PLUS_USER3="Group3";
    export BEANCHANGE_USERGP2="账号2pin&账号3pin&账号4pin"
    export NOTIFY_GROUP3_LIST="京东资产变动#3&京东白嫖榜#3&京东月资产变动#3&省钱大赢家之翻翻乐#3&京东CK检测#3"
    
    ##分组4推送
    export QYWX_AM4="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaxxxxxxx"
    export BEANCHANGE_USERGP4="账号10pin&账号11pin&账号12pin"
    export NOTIFY_GROUP4_LIST="京东资产变动#4&京东白嫖榜#4&京东月资产变动#4&省钱大赢家之翻翻乐#4&Ninja 运行通知&京东CK检测#4"
    
    ##分组5推送
    export QYWX_AM5=""
    export PUSH_PLUS_TOKEN5="ABCDEFGHIJKLMN"
    export PUSH_PLUS_USER5="Group5";
    export NOTIFY_GROUP5_LIST="京东资产变动&京东白嫖榜&京东月资产变动&省钱大赢家之翻翻乐&京东CK检测"
	
	 
	##分组6推送
	export QYWX_AM6="bbbbbbbbbbbbbbbbbbsccccccccccccccccc"
	export NOTIFY_GROUP6_LIST="东东农场领取&东东萌宠领取&汪汪乐园养joy领取&脚本任务更新"


