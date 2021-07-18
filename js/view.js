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
            util.setDataInfo(wrapper, b);
            cont.appendChild(wrapper.firstElementChild);
        }
        return cont;
    }
};
        


//const blogView = {
//    render(id, post) {
//        
//    }
//};


//const detailView = {
//    render(post, comments) {
//        let page = document.getElementById('templ-detail-view').cloneNode(true);
//        page.removeAttribute('templ-detail-view');
//        let post = post.getPost();
//        let cont = page.InnerHTML;
//        let releasedate = post.format(post.date, true);
//        let lastedit = post.format(post.updated, true);
//        cont = cont.replace("%p_title%", post.title).replace("%p_releasedate_f%", releasedate).replace("%p_last_edit_f%", lastedit).replace("%p_content%", post.content);
//    },
//};