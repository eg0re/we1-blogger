"use strict";

const util = {
    // Nimmt alle Attribute von object und ersetzt gleichnamige, mit %<name>%
    // gekennzeichnete Wörter im innerHTML von element mit dem Attributwert
    setDataInfo(element, object) {
        let cont = element.innerHTML;
        for (let key in object) {
            let rexp = new RegExp("%" + key + "%", "g");
            cont = cont.replace(rexp, object[key]);
        }
        element.innerHTML = cont;
    },
    
    childCloneNode(id, removeId) {
        let elem = document.getElementById(id).cloneNode(true);
        if(removeId)
            elem.removeAttribute("id");
        return elem;
    }
};

const initPageView = {
    // Erstellt eine View für die Startseite
    render(blogs) {
        if(!blogs) 
            return;

        let cont = util.childCloneNode("templ-head-nav", true);
        let liTempl = cont.firstElementChild;
        liTempl.remove();

        for(let b of blogs){
            let blogInfo = liTempl.cloneNode(true);
            let wrapper = document.createElement("DIV");
            wrapper.appendChild(blogInfo);
            console.log("filling data info");
            util.setDataInfo(wrapper, b);
            cont.appendChild(wrapper.firstElementChild);
        }
        return cont;
    }
};
        


const blogView = {
    render(id, posts) {
        console.log("rendering Posts from Blog with the id: " + id );
        let cont = document.createElement("div")
        let templ = util.childCloneNode("templ-blog-overview", true);
        let header = templ.children[0];
        templ.removeChild(templ.children[0]);
        cont.append(header);
        for (const post of posts) {
            util.setDataInfo(templ, post);
            console.log(post);
            cont.append(templ.children[0]);
        }
        return cont;
    }
};


//const detailView = {
//    render(post, comments) {
//    
//    },
//};