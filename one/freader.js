'use strict';

var fs=require('fs');

//文件信息
var fileInfos={};

//取得文件长度
function getFilesizeInBytes(filename) {
 var stats = fs.statSync(filename);
 var fileSizeInBytes = stats.size;
 return fileSizeInBytes;
}

//把buf掐头去尾,得到合法的utf8字符串
function buffer2String(buf){
	var i;
	//找第一个完整字的开头位置
	var first=0;
	for (i = 0; i < 4; i++) {
	 if(buf[i]<0x80 || buf[i]>0xBF ){
	 	first=i;break;
	 }
	}
	//找最后一个完整字的开头位置
	var last=buf.length-1;
	for (i = 0; i < 4; i++) {
		var pos=buf.length-1-i;
	 if(buf[pos]<0x80 || buf[pos]>0xBF ){
	 	//console.log('found',pos,buf[pos].toString(16));
	 	last=pos;break;
	 }
	}
	//返回从第一个完整字头(包含)到最后一个字头(不包含)之间的字符串.
	var buf2=buf.slice(first, last);
	var str = buf2.toString('utf8');
	return str;
}


//取得一段字符串
function getParagraph (path,position,length) {
	var fd=fs.openSync(path, 'r');
	var buffer = new Buffer(length);
	var bytesRead=fs.readSync(fd, buffer, 0, length, position);
	fs.close(fd);
    var str=buffer2String(buffer.slice(0,bytesRead));
    //console.log(str);
	return str;
}

//取得文件信息
function getFileInfo(path){
	var len=getFilesizeInBytes(path);
	var head=getParagraph(path,0,300);
	return {
		path:path,
		len:len,
		head:head
	};
}

//随机取得段落
function getRandomParagraph(path){
	if(!fileInfos[path]){
		fileInfos[path]=getFileInfo(path);
	}
	var info=fileInfos[path];
	var pos=Math.floor(Math.random()*info.len);
	return getParagraph(path,pos,1000);
}

var fileList = [];
function walk(path){  
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item){
        if(fs.statSync(path + '/' + item).isDirectory()){
            walk(path + '/' + item);
        }else{
            fileList.push(path + '/' + item);
        }
    });
}
walk('./txt');
console.log(fileList);  

function collectTxtFileInfo(fileList){
	for (var i = 0; i < fileList.length; i++) {
		var path=fileList[i];
		if(/txt$/.test(path)){
			//console.log(path);
			var info=getFileInfo(path);
			fileInfos[path]=info;
		}
	}
}
collectTxtFileInfo(fileList);
console.log(fileInfos);

module.exports={
	getFilesizeInBytes:getFilesizeInBytes,
	getParagraph:getParagraph,
	getFileInfo:getFileInfo,
	getRandomParagraph:getRandomParagraph
};