const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

tmp.setGracefulCleanup();

function getTempDir() {
    return new Promise((resolve, reject) => {
        tmp.dir({unsafeCleanup: true}, (error, dirPath) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(dirPath);
        });
    });
}

function saveToFile(data) {
    return getTempDir()
        .then(dirPath => {
            return new Promise(function(resolve, reject) {
                const saveDir = path.join(dirPath, 'someicon.ico');
                fs.writeFile(saveDir, data, function(error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(saveDir);
                });
            });
        });
}

function downloadIcon(iconUrl) {
    const iconData = new Promise(function(resolve, reject) {
        axios.get(iconUrl, {responseType: 'arraybuffer'})
            .then(function(response) {
                resolve(response.data);
            })
            .catch(function(error) {
                if (error.status === 404) {
                    resolve();
                    return;
                }
                reject(error);
            });
    });

    return iconData.then(iconData => {
        if (!iconData) {
            return new Promise(resolve => resolve());
        }
        return saveToFile(iconData);
    });
}

function downloadIcons(iconUrls) {
    const promises = iconUrls.map(downloadIcon);
    return Promise.all(promises)
        .then((iconPaths) => {
            return iconPaths.filter(element => !!element);
        });
}

module.exports = downloadIcons;
