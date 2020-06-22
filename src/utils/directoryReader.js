/** GLOBAL VARIABLE  at DirectoryReader class. It stores the objects read from the hard drive */
var jsonObjects = [];

/**
 * Reads user selected json files and save them as objects in the global variable jsonObjects.
 * Adapted from: https://www.html5rocks.com/en/tutorials/file/dndfiles/
 */
class DirectoryReader {

    constructor() {
        // Validate the browser compatibility
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log(" Great success! All the File APIs are supported.")
                // GUI
            document.getElementById('files').addEventListener('change', this.handleFileSelect, false);
        } else {
            // If the browser does not suport File class
            window.alert('The File APIs are not fully supported in this browser.');
        }
    }


    /**
     * The function called on 'choose file' button click
     */
    handleFileSelect(evt) {
        //reset global variable
        jsonObjects = [];

        // FileList object files is a FileList of File objects. List some properties.
        let files = evt.target.files;
        console.log(files)
        let htmlOutput = [];
        // iterate over the selected fil
        for (let i = 0, f; f = files[i]; i++) {
            // update GUI
            htmlOutput.push('<li>', escape(f.name), '</li>');
            // Only process geojson files.
            if (!f.type.match('json')) {
                alert("One of the selected files does not have a JSON extension. Double check your file choice");
                continue;
            }
            //Instantiate the file reader
            let reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    //read file content
                    let tmp = JSON.parse(e.target.result);
                    // *** NOTE This line was jsonObjects.push(tmp.features) but it was changed to match imported JSON format on May 2, 2020
                    jsonObjects.push(tmp);
                    // console.log(tmp);
                };
            })(f);
            // Read in the file
            reader.readAsText(f);
        }
        // GUI
        try {
            if (htmlOutput.length > 2) {
                document.getElementById('list').innerHTML = '<ul>' + htmlOutput.join('') + '</ul>';
            } else {
                document.getElementById('list').innerHTML = htmlOutput[0];
            }
        } catch (err) {
            console.log("List element missing");
        }
    }

    /**
     * Gets the objects read from the user selected files
     */
    getJsonObjects() {
        return jsonObjects;
    }
}