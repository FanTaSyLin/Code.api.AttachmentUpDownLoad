var fs = require("fs");
var path = require("path");
var multipart = require("multiparty");

var attachmentDir = process.env.ATTACHMENTDIR || path.join(__dirname, "./../attachments");
module.exports = function (server, BASEPATH) {
    /**
     * 上传附件
     */
    server.post(BASEPATH + "/attachment", _upload);
    /**
     * 下载附件
     */
    server.get(BASEPATH + "/attachment", _download);
}

function _upload(req, res, next) {
    var form = new multipart.Form({
        "uploadDir": attachmentDir,
        "encoding": "utf-8"
    });

    form.parse(req, function (err, fields, files) {
        // var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.end(JSON.stringify(err));
            return next();
        } else {
            var inputFile = files.file[0];
            var uploadedPath = inputFile.path;
            var dstPath = attachmentDir + new Date().getTime() + "." + inputFile.originalFilename;
            fs.rename(uploadedPath, dstPath, function (error) {
                if (error) {
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    res.end(JSON.stringify({
                        "status": "error",
                        "doc": error
                    }));
                } else {
                    res.writeHead(200, {
                        'content-type': 'text/plain;charset=utf-8'
                    });
                    res.end(JSON.stringify({
                        "status": "success",
                        "doc": dstPath
                    }));
                }
            });
            return next();
        }
    });
}

function _download(req, res, next) {
    var filePath = req.params["path"];
    if (!filePath) {
       res.end();
       return next(); 
    }
    fs.exists(filePath, function (exist) {
        if (!exist) {
            res.writeHead(404, {
                "Content-Type": "text/plain"
            });
            res.write("This resource " + filePath + "was not found on this server.");
            res.end();
            return next();
        } else {
            fs.readFile(filePath, function (err, file) {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.write(JSON.stringify(err));
                    res.end();
                    return next();
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Content-Length': file.length
                    });
                    res.write(file, "binary");
                    res.end();
                    return next();
                }
            });
        }
    });
}
