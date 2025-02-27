/**
 * Fetches the file list and data for a given directory.
 * 
 * @param {string} directory - The directory to fetch the file list and data from.
 * @returns {Promise} A promise that resolves with an array of file data objects.
 */
export async function fetchFileListAndData(directory) {
    let geoJSONFilesAndData = [];
    try {
        directory = directory.trim();
        const response = await fetch(`/fileListAndData?directory=${encodeURIComponent(directory)}`);
        if (!response.ok) {
            throw new Error(`fetchFileListAndData(directory) - Failed to fetch file list and data. Server responded with status ${response.status}: ${errorMessage}`);
        }
        const data_res = await response.json();
        if (data_res.error) {
            throw new Error(`Error fetching file list: ${data_res.error}`);
        }
        data_res.files.forEach(file => {
                // Get the name of the file (without extension) and split it at the first underscore
                let fileName = file.name;
                if ((file.mimeType === 'application/json')){
                    let type = fileName.substring(0, fileName.indexOf('_'));
                    // Add the file to the array
                    geoJSONFilesAndData.push({ data: file.data, type: type , fileName: fileName});
                }else if (file.mimeType.startsWith('image/')){
                    // Add the file to the array
                    let imageData = 'data:' + file.mimeType + ';base64,' + file.data;
                    geoJSONFilesAndData.push({ data: imageData, fileName: fileName});                    
                }else {
                    console.warn('Error fetching file list: unknown kind of data');
                    geoJSONFilesAndData.push({ data: file.data});
                }
        });
        return geoJSONFilesAndData;
    } catch (error) {
        console.error('Error fetching file list and data:', error);
        return [];
    }
} 

export async function fetchFileList(directory){
    let fileList = [];
    try {
        directory = directory.trim();
        const response = await fetch(`/fileList?directory=${encodeURIComponent(directory)}`);
        if (!response.ok) {
            throw new Error(`fetchFileList(directory) - Failed to fetch file list. Server responded with status ${response.status}: ${errorMessage}`);
        }
        const data_res = await response.json();
        if (data_res.error) {
            throw new Error(`Error fetching file list: ${data_res.error}`);
        }
        data_res.files.forEach(file => {
            fileList.push({fileName: file.name, mimeType: file.mimeType, path: file.path});
        });
        return fileList;
    } catch (error) {
        console.error('Error fetching file list:', error);
        return [];
    }
}