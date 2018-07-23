DROP TABLE `_app_panel_del`;
DROP TABLE `_category_del`;
DROP TABLE `_default_effects_del`;
DROP TABLE `_designer_ghc`;
DROP TABLE `_designer_gho`;
DROP TABLE `_effect_crontab_del`;
DROP TABLE `_media_effect_del`;
DROP TABLE `devicehub_hardware`;
DROP TABLE `devicehub_strategy`;
CREATE TABLE `aweme_sticker` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `old_id` bigint(20) DEFAULT NULL,
  `user_name` varchar(128) NOT NULL,
  `file_uri` text,
  `icon_uri` text,
  `create_time` bigint(128) NOT NULL,
  `modify_time` bigint(128) NOT NULL,
  `sticker_name` text,
  `title` text,
  `status` int(10) DEFAULT NULL COMMENT '0-下线， 1－内测， 2-上线',
  `region` varchar(8) DEFAULT 'CN' COMMENT '国家码 eg: CN JP',
  `device_platform` varchar(20) DEFAULT 'all' COMMENT '手机平台，如:android,iphone',
  `version_code` int(10) DEFAULT '0' COMMENT 'APP版本，如:141,137',
  `type` int(10) DEFAULT '0' COMMENT '贴纸类型0：正常 1：3D 2：分割',
  `mark_uri` varchar(128) DEFAULT NULL COMMENT '标签URI',
  `expiration_time` datetime DEFAULT NULL COMMENT '过期时间',
  `usage_scenario` int(11) NOT NULL DEFAULT '0' COMMENT '贴纸的使用场景，按位取值，最低位为1表示短视频试用，第二位直播，整体取值0时表示对所有适用',
  `date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `devicehub_strategies` (
  `id` int(11) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` int(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `filter` text,
  `params` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `effect_draft` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '特效名称',
  `file_uri` varchar(256) NOT NULL DEFAULT '' COMMENT '特效文件地址',
  `icon_uri` varchar(256) NOT NULL COMMENT '特效图标地址',
  `description` varchar(256) DEFAULT NULL COMMENT '特效提示文案',
  `device_id` varchar(128) DEFAULT NULL COMMENT '设备唯一标识',
  `uuid` varchar(128) DEFAULT NULL COMMENT '唯一id',
  `size` int(11) DEFAULT NULL COMMENT '特效包体积 单位：Byte',
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '特效类型 0: 道具 1: 滤镜',
  `sdk_version` int(11) NOT NULL COMMENT '最低兼容的 sdk 版本',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '特效草稿创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '特效草稿更新时间',
  `file_types` varchar(256) DEFAULT NULL COMMENT '特效种类，解析贴纸文件得到，逗号分隔',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UUID` (`uuid`),
  KEY `TYPE` (`type`),
  KEY `SDK_VERSION` (`sdk_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `hotsoon_sticker` (
  `id` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `md5` varchar(255) DEFAULT NULL,
  `icon_uri` varchar(255) DEFAULT NULL,
  `file_uri` varchar(255) DEFAULT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `create_time` varchar(255) DEFAULT NULL,
  `modify_time` varchar(255) DEFAULT NULL,
  `extra` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `wherego_score` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL COMMENT '用户 id',
  `score` int(11) NOT NULL DEFAULT '0' COMMENT '游戏得分',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `wherego_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `openid` int(11) NOT NULL COMMENT '头条uid',
  `username` varchar(50) NOT NULL DEFAULT '' COMMENT '头条用户名',
  `avatar` varchar(256) NOT NULL DEFAULT '' COMMENT '头条用户头像',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALERT TABLE `_app_effect_del` DROP COLUMN `android_model`,DROP COLUMN `android_type`,DROP COLUMN `effect_file_types`,DROP COLUMN `ios_model`,DROP COLUMN `ios_type`,DROP COLUMN `sdk_version`;
ALERT TABLE `app_effect` DROP COLUMN `app_channel`,DROP COLUMN `app_channel_key`,DROP COLUMN `effect_order`,DROP COLUMN `offline_time`,DROP COLUMN `position`,DROP COLUMN `scheduled`,ADD COLUMN `effect_desc_icon` varchar(256) NULL  COMMENT '特效提示图片',MODIFY `children` text NULL  COMMENT '子集合的appeffectid',MODIFY `effect_description` varchar(128) NULL  COMMENT '特效提示文案',MODIFY `effect_file_types` varchar(256) NULL  COMMENT '特效种类，解析贴纸文件得到，逗号分隔',MODIFY `effect_icon` varchar(256) NULL  COMMENT '特效图标',MODIFY `ios_model` text NULL  COMMENT 'ios机型1',MODIFY `parent_id` bigint(11) NULL DEFAULT '0'  COMMENT '父级appeffectid',MODIFY `publish_time` datetime NULL  COMMENT '上线时间',MODIFY `related_words` text NULL  COMMENT 'appeffect的关联词';
ALERT TABLE `devicehub_black_white` DROP COLUMN `bucket`,MODIFY `id` int(11) NOT NULL  auto_increment COMMENT '',MODIFY `model` varchar(255) NOT NULL  COMMENT '';
ALERT TABLE `aweme_sticker` ADD CONSTRAINT foo PRIMARY KEY (`id`);
ALERT TABLE `devicehub_strategies` ADD CONSTRAINT foo PRIMARY KEY (`id`);
ALERT TABLE `effect_draft` ADD CONSTRAINT foo PRIMARY KEY (`id`),ADD CONSTRAINT `UUID` UNIQUE (`uuid`);
ALERT TABLE `wherego_score` ADD CONSTRAINT foo PRIMARY KEY (`id`);
ALERT TABLE `wherego_user` ADD CONSTRAINT foo PRIMARY KEY (`id`);
