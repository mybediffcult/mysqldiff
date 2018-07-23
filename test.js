
const url = require('url');
const mysqlClient = require('./app/dialects/mysql-client');
const fs = require('fs');

const options = 'mysql://effect_w:vuduwtS04jC83z6_9kIken4AaDuYMjCn@10.11.17.171:3746/effect';
const devOptions = 'mysql://effect_dev_w:1kQo4m9cQMbdDghL_xQ8EJ8sR0NHy2pL@10.6.19.35:3307/effect_dev';

const sql = new mysqlClient(options);
const devSql = new mysqlClient(devOptions);

const format = (i)=>i === null ? null : `'${i}'`;

const category = [{id: 487, name: 'hot'}, {id: 488, name: 'new'}, {id: 489, name: 'beautycute'}];
// uid 为空
sql.query('select app_id,effect_id,effect_type,effect_alias,platform,\
ios_version,android_version,channel,app_channel,publish_status,effect_order,effect_icon,\
effect_description,region_key,effect_file,tags,sdk_version,effect_file_types,ios_type,\
android_type,android_model,ios_model,album_id,children,parent_id,\
related_words from  app_effect where app_id=184 and region_key=\'cn\' and channel=1 order by updated_at limit 100')
    .then(async res=>{
        const result = [];
        res.rows.forEach(i=>result.push(i));
        console.log(result.length);
        for (let i of result) {
            const { effect_id, effect_type, effect_alias, platform,
                ios_version, android_version, channel, app_channel, publish_status, effect_order, effect_icon,
                effect_description, region_key, effect_file, tags, sdk_version, effect_file_types, ios_type,
                android_type, android_model, ios_model, album_id, children, parent_id,
                related_words} = i;
            console.log('dev:', `INSERT INTO app_effect (app_id,effect_id,effect_type,effect_alias,platform,\
            ios_version,android_version,channel,publish_status,uid,effect_icon,\
            effect_description,region_key,effect_file,tags,sdk_version,effect_file_types,ios_type,\
            android_type,android_model,ios_model,album_id,children,parent_id,\
            related_words) VALUES  (294, ${effect_id}, ${effect_type},${format(effect_alias)}, ${platform},
    ${ios_version}, ${android_version}, ${channel}, ${publish_status}, 309, ${format(effect_icon)},
    ${format(effect_description)}, ${format(region_key)}, ${format(effect_file)}, ${format(tags)}, ${sdk_version}, ${format(effect_file_types)}, ${ios_type},
    ${android_type}, ${format(android_model)}, ${format(ios_model)}, ${format(album_id)}, ${format(children)}, ${parent_id},
    ${format(related_words)})`);
            console.log(`INSERT INTO app_effect (app_id,effect_id,effect_type,effect_alias,platform,\
            ios_version,android_version,channel,app_channel,publish_status,effect_order,uid,effect_icon,\
            effect_description,region_key,effect_file,tags,sdk_version,effect_file_types,ios_type,\
            android_type,android_model,ios_model,album_id,children,parent_id,\
            related_words) VALUES  (294, ${effect_id}, ${effect_type},${format(effect_alias)}, ${platform},
    ${ios_version}, ${android_version}, ${channel}, ${app_channel}, ${publish_status}, ${effect_order},309, ${format(effect_icon)},
    ${format(effect_description)}, ${format(region_key)}, ${format(effect_file)}, ${format(tags)},  ${sdk_version},  ${format(effect_file_types)}, ${ios_type},
    ${android_type}, ${format(android_model)}, ${format(ios_model)}, ${format(album_id)}, ${format(children)}, ${parent_id},
    ${format(related_words)})`);
            // await devSql.query(`INSERT INTO app_effect (app_id,effect_id,effect_type,effect_alias,platform,\
            //             ios_version,android_version,channel,publish_status,uid,effect_icon,\
            //             effect_description,region_key,effect_file,tags,sdk_version,effect_file_types,ios_type,\
            //             android_type,android_model,ios_model,album_id,children,parent_id,\
            //             related_words) VALUES  (294, ${effect_id}, ${effect_type},${format(effect_alias)}, ${platform},
            //     ${ios_version}, ${android_version}, ${channel}, ${publish_status}, 309, ${format(effect_icon)},
            //     ${format(effect_description)}, ${format(region_key)}, ${format(effect_file)}, ${format(tags)}, ${sdk_version}, ${format(effect_file_types)}, ${ios_type},
            //     ${android_type}, ${format(android_model)}, ${format(ios_model)}, ${format(album_id)}, ${format(children)}, ${parent_id},
            //     ${format(related_words)})`);
        }
        fs.writeFileSync(__dirname + '/ids.txt', JSON.stringify(result));
        process.exit(0);
    });

// sql.query('show create table effect')
//     .then(res=>console.log(res));

