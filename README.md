# mysqldiff
 
  ### 本项目主要用来对比两个数据库，生成对应的改动sql语句。目前只支持mysql数据库。

  ### 使用方法
    npm install 
    
    mysqldiff run -S mysql://user:pass@host[:port]/dbname -T mysql://user:pass@host[:port]/dbname

  ### 可选参数设置

    //源数据库，参数类型可以为mysql://user:pass@host[:port]/dbname 或 数据库配置的js文件
    -S,--source  <source>  

    //目的数据库，参数类型可以为 mysql://user:pass@host[:port]/dbname 或 数据库配置的js文件
    -T,--target <target>

    //数据库配置文件的路径，指定不在当前进程目录下的文件。此配置对source和target统一处理
    -C --configPath <configPath>
     
    //是否对结果进行处理，默认是处理。不处理的话，返回对比的结果对象。true(默认):处理,false:不处理  
    -P ,--processed [processed] 

    //处理的话是否展示某些warn对象，默认是展示。结果中不做差异化处理.true(默认):展示,false:不展示
    -W --warn  [warn] 

    //选择处理策略，是否将同一表的操作聚合到一个语句。true(默认):聚合，false:分散
    -M --merge  [merge]

    //支持外部处理方式，使用自己的处理方式。个性化处理方式，可部分替换处理方式，可全部替换。
    -F --file  <file>


 ### 例子

    //数据库参数类型可混合,没有配置-C的话，a.js应该在当前执行目录下能找到 
    mysqldiff run -S mysql://user:pass@host[:port]/dbname -T a.js 









