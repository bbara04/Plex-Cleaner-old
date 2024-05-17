//Pre fetch

//Expired media list prefetch
let ExpiredMediaJson = null;

async function getExpiredMedia(){
    try {
        const response = await fetch('/media/expired');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        ExpiredMediaJson = data;
    } catch (error) {
        console.error('Hiba történt az adatok lekérése közben:', error);
    }
}

getExpiredMedia();



//All media list prefetch
let AllMediaJson = null;

async function getAllMedia(){
    try {
        const response = await fetch('/media/all');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        AllMediaJson = data;
    } catch (error) {
        console.error('Hiba történt az adatok lekérése közben:', error);
    }
}



//Global variables

//Selected media list by id
let selected_media = new Set([]);

//All media list by id
let all_media_id = new Set([]);

//Typemap for media name and type (Suits, Series), (The Matrix, Movie)
const typemap = new Map();



//Base state

async function setupBaseState(){
    await getAllMedia();
    listFiles(AllMediaJson);
}

setupBaseState();



//List files
async function listFiles(data) {

    //Set to base state
    selected_media.clear();
    all_media_id.clear();
    typemap.clear();

    const list = document.querySelector('.mediasection');
    removeChildren(list);


    //Sort data by name
    data.sort((a, b) => a[0].localeCompare(b[0]));
    
    for(let str of data){
        
        all_media_id.add(str[2]);
        typemap.set(str[2], [str[0], str[3]]);

        //Create media item field
        let list_item_container = document.createElement("div");
        list_item_container.className = "media-list-item";

        //Create checkbox
        let list_item_input = document.createElement("input");
        list_item_input.type = "checkbox";
        list_item_input.addEventListener('change', function(){
            if(this.checked){
                selected_media.add(str[2]);
            }else{
                selected_media.delete(str[2]);
            }
        });

        //Create text container
        let list_text_container = document.createElement("div");
        list_text_container.className = "list-text-container";
   
        let list_item_label = document.createElement("label");
        list_item_label.className = "title";
        list_item_label.textContent = str[0];

        let list_item_watchtime = document.createElement("label");
        list_item_watchtime.id = "watchtime";
        list_item_watchtime.textContent = "Last: "+str[1]+ " days ago";
        
        list_text_container.appendChild(list_item_label);
        list_text_container.appendChild(list_item_watchtime);


        list_item_container.appendChild(list_item_input);
        list_item_container.appendChild(list_text_container);
        list.appendChild(list_item_container);
    }
}



//Remove all children from parent
function removeChildren(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}



//Set empty list state
function emptyListHandler(text){
    let base_text = document.createElement("span");
    base_text.textContent = text;
    base_text.className = "base-text";
    document.querySelector('.mediasection').appendChild(base_text);
}



//Select all button setup
const sel_all = document.querySelector('#sel_all');
sel_all.addEventListener('click', function(){
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for(let checkbox of checkboxes){
        checkbox.checked = true;
    }
    for(let id of all_media_id){
        selected_media.add(id);
    }
});



//Select none button setup
const sel_none = document.querySelector('#sel_none');
sel_none.addEventListener('click', function(){
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for(let checkbox of checkboxes){
        checkbox.checked = false;
    }
    selected_media.clear();
});



//List clear button setup
const list_clear = document.querySelector('#clear');
list_clear.addEventListener('click', function(){
    //Delete section content
    removeChildren(document.querySelector('section'));
    emptyListHandler("No files to show");
});



//Pre-query
const list_all = document.querySelector('#list_all');
const list_expired = document.querySelector('#list_expired');



//List all button setup
list_all.addEventListener('click', function(){
    listFiles(AllMediaJson);
    list_all.className = "func_button_clicked";
    list_expired.className = "func_button";
});



//List expired button setup
list_expired.addEventListener('click', function(){
    listFiles(ExpiredMediaJson);
    list_expired.className = "func_button_clicked";
    list_all.className = "func_button";
});



//Delete button setup
const button = document.querySelector('.delete-button');
button.addEventListener('click', function(){
    //Make JSON for API
    let jsonforsend = [];
    for(let id of selected_media){
        jsonforsend.push([id, typemap.get(id)[1]]);
    }
  
    //Api fetch
    fetch('/media',{
        method:'POST',
        body: JSON.stringify(Array.from(jsonforsend)),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data =>{
        console.log(data);
    })

        //Delete section content
        removeChildren(document.querySelector('section'));
        emptyListHandler("Deleted");
    });