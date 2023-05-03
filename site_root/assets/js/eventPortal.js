 var allevents = [["Apple",["Food","Yellow"]],["Run",["Exersize","Fitness"]],["Cheese",["Food","Fitness"]],["Cat",["Exersize","Fitness"]]
,["cheeta",["Exersize","Fitness"]],["parakeet",["Exersize","Fitness"]],["Dog",["Sack","Fitness"]]];

catstemp = []
for(let i = 0; i<10;++i){
    str = i
        //for(let x = 0; x<Math.floor((Math.random() * 5) + 6); ++x){
        //    str+=String.fromCharCode((Math.floor((Math.random() * 100) + 1)%25) + 65);
        //}
    catstemp.push(str)
}

for(let i = 0; i<10;++i){ // gen events
    let str="";
    let arr= [];
    for(let x = 0; x<Math.floor((Math.random() * 5) + 5); ++x){
        str+=String.fromCharCode((Math.floor((Math.random() * 100) + 1)%25) + 65);
    }
    arr.push(str);
    arr.push([]);
    for(let x = 0; x<Math.floor((Math.random() * 10))%2+3; ++x){
            rand = catstemp[Math.floor((Math.random() * 50)+1)%(catstemp.length-1)]
            arr[1].push(rand);
            arr[0] =rand+"-"+arr[0]
    }
    
    
    allevents.push(arr);
}

allevents.sort((a,b)=>{
    a1 = a[0].toLowerCase()
    b1 = b[0].toLowerCase()
    if(a1<b1) return -1;
    if(a1>b1) return 1;
    return 0});

var transitionEnd = 'webkitTransitionEnd oTransitionEnd transitionend otransitionend';

function hideEventEdit(){

    $('body').removeClass('NoScroll')
   
    $("#EveEdit").removeClass("animate-from-invisable");
    $("#EveEdit").addClass("animate-to-invisable");
    setTimeout(function() {
        $("#EveEdit").addClass("displayNone");$("#exitbtn").removeClass("rotate180"); $('#overlay').addClass('displayNone');
    },200)
}

function showEventEdit(){
    $('body').addClass('NoScroll')
    $('#overlay').removeClass('displayNone');
    $("#EveEdit").addClass("animate-from-invisable");
    $("#EveEdit").removeClass("displayNone");
    $("#EveEdit").removeClass("animate-to-invisable");

}

$("#EveEdit #exitbtn").click(()=>{   
    hideEventEdit();
    $("#exitbtn").addClass("rotate180");
    
})
$("#EveEdit .Cancel").click(()=>{ 
    hideEventEdit();
})


$("#createEvent").click(()=>{
    showEventEdit();
})


function populateEventButtons(arr){
    let i = 1;
    arr.forEach(e=>{
        $(`#eveselect`).append(`<optbutton class= "optbutton" id=eve${e[0]}>${e[0]}<optbutton/>`)
        i= (i%10)+1;
    });
}


function createLookupDickFromArr(arr){
    arr.forEach(e=>{})
}

function populateCatButtons(dict){
    let i = 1;
    for(var key in dict){
        $(`.flexbuttons:nth-of-type(${i})`).append(`<optbutton class= "optbutton" id=cat${key}>${key}<optbutton/>`)
        i= (i%4)+1;
    }
}

function createAndFillArray(size,val){
    arr = Array(size)
    for(let i = 0; i<size; ++i){
        arr[i] =(val);
    }
    return arr;
}

class Filters{
    constructor(){
        

        this.eventSearchSubset = allevents;
        this.eventFilters = [[],[]]
        this.initializeVars()


        populateCatButtons(this.catIndex);
        populateEventButtons(this.eventSearchSubset);

    } 

    initializeVars(){
        this.catIndex = Object()
        this.catsClickCount = 0;
        this.genCatIndex()
        this.eventFilters = [createAndFillArray(allevents.length,true),createAndFillArray(allevents.length,true)]
    }

    genCatIndex(){
        for(let i = 0; i<allevents.length; ++i){
            allevents[i][1].forEach(c=>{
                if(!(c in this.catIndex)) this.catIndex[c] = [0,[]]; // sets all categories to inactive
                this.catIndex[c][1].push(i)
            });
        }
    }

    alterFilter(row,val){ // edits a row in filter if not already in state editting it to, ands all filter layers together
        if(this.eventFilters[0][row]==val) return false;
        if(val==false){this.eventFilters[0][row] = false; return true;}
        for(let x = 1; x<this.eventFilters.length; ++x){
            if(this.eventFilters[x][row]==false) return true;
        }
        this.eventFilters[0][row]=true;
        return true;
    }
    
    strFilterEvents(str){
        let updated = []
        let val = str.toLowerCase()
        let i = 0;
        val+=String.fromCharCode(1);
        
        while(this.eventSearchSubset[i][0].toLowerCase()+String.fromCharCode(1)<val){
            this.eventFilters[1][i] = false;
            if(this.alterFilter(i,false)){updated.push(i);}
            ++i;
            if(this.eventSearchSubset.length<=i){this.updateEventVisability(updated); return;}
        }
      
        val =  val.slice(0,-1);
        while(this.eventSearchSubset[i][0].toLowerCase().slice(0,val.length)==val){
            this.eventFilters[1][i] = true;
            if(this.alterFilter(i,true)){updated.push(i);}
            ++i;
            if(this.eventSearchSubset.length<=i){ this.updateEventVisability(updated); return;}
        }
        
        while(this.eventSearchSubset.length>i){
            this.eventFilters[1][i] = false;
            if(this.alterFilter(i,false)){updated.push(i);}
            ++i;
        }
        this.updateEventVisability(updated)
    }
    
    
    catFilterEvents(cat){
        let updated = []

        if(!(cat in this.catIndex)) console.log("ERROR cat clicked doesnt match known categories");
        if(this.catIndex[cat][0]!=0){ // if toggling to remove cat
            this.eventFilters.splice(this.catIndex[cat][0],1);
            for(let i = 0; i < this.eventFilters[0].length; ++i){
                if(this.alterFilter(i,true)){updated.push(i);}
            }
            this.catIndex[cat][0] = 0;
            
            
        }else{ // if toggling to add cat
            this.catIndex[cat][0] = this.eventFilters.length;
            this.eventFilters.push(createAndFillArray(this.eventFilters[0].length,false)); //create a new filter entry
            let ind = 0;
            for(let i = 0; i < this.eventFilters[0].length; ++i){
                if(this.catIndex[cat][1][ind]==i){++ind; this.eventFilters[this.catIndex[cat][0]][i] = true; continue;}
                
                if(this.alterFilter(i,false)){updated.push(i);}
            }    
        }

        this.updateEventVisability(updated)
    }

    updateEventVisability(arr){
        arr.forEach(e=>{
            if(this.eventFilters[0][e]){$(`#eve${allevents[e][0]}`).removeClass("invisable");}
            else{$(`#eve${allevents[e][0]}`).addClass("invisable");}
        });
    }
    
    
} 


let buttonFilters = new Filters() // search and category filtering

 $("#eventin").keyup(()=>{
    let val = $("#eventin").val();
    buttonFilters.strFilterEvents(val);
});

$(".flexbuttons > optbutton").click(function () {
    let id = $(this).attr("id");
    id = id.slice(3);
    buttonFilters.catFilterEvents(id);
}); 
$("optbutton").click(function (){
    $(this).toggleClass("optbutton-Clicked");
});

showEventEdit()

//Event creating/editing scripts

class FormCreator{
    constructor(){
        
    }
}

var i = 0

$("#add-new-form i").click(function(e) {
    switch($("#add-new-form .dropdown").val()){
        case "Drop Down":
            $(this).parent().before(`<div class = "dropSelectForm"></div>`)
            ++i;
            createDropDown($(this).parent().prev()[0],["sdf","Event2"],true,Title="DROP IT DOWN")
        break;

        case "Button Range Select":
            
        break;

        default:
            alert("Invalid Form Type")
    }
})




























/* (function() {
    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.getElementById('catselect').scrollLeft -= (delta * 40); // Multiplied by 40
        e.preventDefault();
    }
    if (document.getElementById('catselect').addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.getElementById('catselect').addEventListener('mousewheel', scrollHorizontally, false);
        // Firefox
        document.getElementById('catselect').addEventListener('DOMMouseScroll', scrollHorizontally, false);
    } else {
        // IE 6/7/8
        document.getElementById('catselect').attachEvent('onmousewheel', scrollHorizontally);
    }
})(); */