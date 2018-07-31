# dbdiff2
 
  ## 本项目主要用来对比两个数据库，生成对应的改动sql语句。目前只支持mysql数据库。
  ## This project is mainly used to compare two databases and generate corresponding changes to the sql statement. Currently only mysql database is supported.

  ### 下载 Installing
  #### 通过npm全局下载 (Install globally with npm)
  ```bash
    npm install dbdiff2 -g
  ``` 
  ### 使用方法use
  #### 使用数据库描述字符串,-s指的是目前修改的库，-t指的是你将要修改的目的库。
  #### Use the database description string, -s refers to the currently modified library, and -t refers to the destination library you are about to modify.

  ```bash
    mysqldiff run -s mysql://username:password@host[:port]/name -t mysql://username:password@host[:port]/name
  ```
  #### 你也可以使用js文件的形式当作参数，不过js文件必须返回一个包含username、password、host、port、name的对象
  #### You can also use the form of the js file as a parameter, but the js file must return an object containing username, password,  host, port, name.
  
  ```bash
    mysqldiff run -s a.js -t mysql://username:password@host[:port]/name
  ```

  #### js文件和数据库描述字符串是等价的。当你的js文件不在当前执行目录下时候，你需要配置-c 来定义js文件的位置。
  #### The js file and the database description string are equivalent. When your js file is not in the current execution directory, you need to configure -c to define the location of the js file.

  ### 可选参数介绍 Optional parameter introduction
    
  #### 源数据库，参数类型可以为mysql://username:password@host[:port]/name 或 数据库配置的js文件
  #### Source database, parameter type can be mysql://username:password@host[:port]/name or database configuration js file
  ```
    -s,--source  <source>  
  ```

  #### 目的数据库，参数类型可以为 mysql://username:password@host[:port]/name 或 数据库配置的js文件
  #### Destination database, parameter type can be mysql://username:password@host[:port]/name or database configuration js file
  ```
    -t,--target <target>
  ```  

  #### 数据库配置文件的路径，指定不在当前进程目录下的文件。此配置对source和target统一处理
  #### The path to the database configuration file, specifying files that are not in the current process directory. This configuration is unified for source and target
  ```
    -c --configPath <configPath>
  ``` 
  #### 输出文件路径，指定输出结果的路径
  #### Output the path of the file, specifying the path of the output result
  ```
    -d --dist <distPath>
  ```
 
  #### 是否对结果进行处理，默认是处理。不处理的话，返回对比的结果对象。true(默认):处理,false:不处理
  #### Whether to process the result, the default is processing. If not processed, return the result object of the comparison. True (default): processing, false: no processing
  ```  
    -p ,--processed [processed] 
  ```  

  #### 处理的话是否展示某些warn对象，默认是展示。结果中不做差异化处理.true(默认):展示,false:不展示
  #### Whether to display some warn objects if processed, the default is display. No differentiation is done in the result. true (default): display, false: no display
   ```
    -w --warn  [warn] 
  ```

  #### 选择处理策略，是否将同一表的操作聚合到一个语句。true(默认):聚合，false:分散
  #### Select a processing strategy to aggregate the operations of the same table into a single statement. True (default): aggregate, false: scattered
   ```
    -m --merge  [merge]
   ``` 

  #### 支持外部处理方式，使用自己的处理方式。个性化处理方式，可部分替换处理方式，可全部替换。
  #### Support external processing methods and use your own processing methods. Personalized processing, partial replacement processing, can be replaced.
  ```
    -f --file  <file>
  ```  


  ### 例子 example

  #### 源文件和目的文件返回对象 Source file and destination file return object

  ```
   {
     name,
     username,
     host,
     port,
     password
   }
  ```

  #### 自己处理文件格式,请[参考](https://github.com/mybediffcult/mysqldiff/blob/master/lib/common/func.js)。可从中选取部分配置,结果会将自己文件里的配置与原处理方式merge。
  #### To handle the file format yourself, please refer to [Reference](https://github.com/mybediffcult/mysqldiff/blob/master/lib/common/func.js). Some configurations can be selected from it, and the result will be merged with the original processing in the file.

  ```
  {
    dropTable : (table)=>`DROP TABLE ${table};\n`,
    createTable : (table)=>`${table};\n`,
    createIndex: ({name, type, keys}, tableName)=>`ALTER ${tableName} ADD INDEX ${name} USING ${type} (${keys});\n`,
    dropIndex: (index, tableName)=>`ALTER ${tableName} DROP INDEX ${index};\n`,
    dropColumn: (columnName, tableName)=>`ALTER ${tableName} DROP COLUMN ${columnName};\n`,
    addColumn: ({columnName, description, comment}, tableName)=>`ALTER ${tableName} ADD COLUMN ${columnName} ${description}  COMMENT ${comment};\n`,
    modifyColumn: ({columnName, comment, description, extra}, tableName)=>`ALTER ${tableName} MODIFY ${columnName} ${description} ${extra} COMMENT ${comment};\n`,
    addPrimaryConstraint: ({name, keys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} PRIMARY KEY (${keys});\n`,
    addUniqueConstraint: ({name, keys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} UNIQUE (${keys});\n`,
    addForeignConstraint: ({name, keys, references, foreignKeys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} FOREIGN KEY (${keys}) REFERENCES ${references} (${foreignKeys});\n`,

  }
  ```

