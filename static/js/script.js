//Base state
//Api fetch
fetch('/media/all')
.then(response => {
if (!response.ok) {
    throw new Error('Hálózati válasz nem volt oké');
}
return response.json();
})
.then(data => {
    listFiles(data);
})
.catch(error => {
    console.error('Hiba történt az API lekérése során:', error);
});

    //List files for delete
    var selected_media = new Set([]);
    let all_media_id = new Set([]);
    const typemap = new Map();

    //List files
    function listFiles(data) {

        //Set to base state
        selected_media.clear();
        all_media_id.clear();
        typemap.clear();

        const list = document.querySelector('section');
        removeChildren(list);

        data.sort((a, b) => a[0].localeCompare(b[0]));
        
        for(let str of data){
            
            all_media_id.add(str[2]);
            typemap.set(str[2], [str[0], str[3]]);
            let list_item_container = document.createElement("div");
            list_item_container.className = "movie-list-item";
            let list_item_input = document.createElement("input");
            list_item_input.type = "checkbox";
            list_item_input.addEventListener('change', function(){
                if(this.checked){
                    selected_media.add(str[2]);
                }else{
                    selected_media.delete(str[2]);
                }
            });
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
        document.querySelector('section').appendChild(base_text);
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

    //List all button setup
    const list_all = document.querySelector('#list_all');
    list_all.addEventListener('click', function(){

    //Api fetch
    fetch('/media/all')
    .then(response => {
    if (!response.ok) {
        throw new Error('Hálózati válasz nem volt oké');
    }
    return response.json();
    })
    .then(data => {
        listFiles(data);
    })
    .catch(error => {
        console.error('Hiba történt az API lekérése során:', error);
    });
});

    //List expired button setup
    const list_expired = document.querySelector('#list_expired');
    list_expired.addEventListener('click', function(){

    //Api fetch
    fetch('/media/expired')
    .then(response => {
    if (!response.ok) {
        throw new Error('Hálózati válasz nem volt oké');
    }
    return response.json();
    })
    .then(data => {
        listFiles(data);
    })
    .catch(error => {
        console.error('Hiba történt az API lekérése során:', error);
    });
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


    //Settings button setup
    var popup = document.querySelector('#SettingsModal');

    var btn = document.querySelector('.settings');

    var span = document.querySelector('.close');

    btn.addEventListener('click', function(){   
        popup.style.display = 'block';
    });

    span.addEventListener('click', function(){
        popup.style.display = 'none';
    });

    window.addEventListener('click', function(event){
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    });

//Collapsible sections setup
var collapsible = document.getElementsByClassName("collapsible");

//Api fetch
fetch('/config')
.then(response => {
    if (!response.ok) {
        throw new Error('Hálózati válasz nem volt oké');
    }
    return response.json();
})
.then(data => {
    //Set values
    setupCollapsible(data);
})
.catch(error => {
    console.error('Hiba történt az API lekérése során:', error);
});

    //global config data
    let settings_data = {};

//Set values
function setupCollapsible(data){
    settings_data = data;
    for(let section of collapsible){
        let content = section.children[1];
        let inputs = content.querySelectorAll('input');
        for(let input of inputs){
            let input_name = input.name;
            let input_json = input_name.split("-");
            input.placeholder = settings_data[input_json[0]][input_json[1]];
        }
    }
}

    for(let section of collapsible){
        section.children[0].addEventListener("click", function() {
            let content = section.children[1];
            if (content.className === "content-hidden"){
                content.className = "content";
            } else {
                content.className = "content-hidden";
            }
        });
    }

    //Save button setup
    collapsible = document.getElementsByClassName("collapsible");

    let save = document.querySelector('.save-button');
    save.addEventListener('click', function(){
        for(let section of collapsible){
            let content = section.children[1];
            let inputs = content.querySelectorAll('input');
            for(let input of inputs){
                if(input.value != ""){
                    let input_name = input.name;
                    intput_json = input_name.split("-");
                    settings_data[intput_json[0]][intput_json[1]] = input.value;
                }
            }
        }
        setupCollapsible(settings_data);

    //Api fetch
    fetch('/config',{
        method:'POST',
        body: JSON.stringify(settings_data),
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
});