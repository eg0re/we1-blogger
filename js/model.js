"use strict";
const model = (function () {
    // Private Variablen
    let loggedIn = false;

    let pathGetBlogs = 'blogger/v3/users/self/blogs';
    let pathBlogs = 'blogger/v3/blogs';
    
    // Private Funktionen 

    // Formatiert den Datum-String in date in zwei mögliche Datum-Strings: 
    // long = false: 24.10.2018
    // long = true: Mittwoch, 24. Oktober 2018, 12:21
    function formatDate(date, long) {
        let opLong = {weekday:'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        let convDate = new Date(date);
        if(long)
            return convDate.toLocaleDateString('de-DE', opLong);
        else
            return `${convDate.getDate()}.${convDate.getMonth() + 1}.${convDate.getFullYear()}`;
    }
    
    // Konstruktoren für Daten-Objekte
    function Blog(b_id, b_name, b_nrposts, b_creationdate, b_lastedit, b_url){
        this.b_id = b_id;
        this.b_name = b_name;
        this.b_nrposts = b_nrposts;
        this.b_creationdate = b_creationdate;
        this.b_lastedit = b_lastedit;
        this.b_url = b_url;
    }
    Blog.prototype.setFormatDates = function(long) {
        this.b_creationdate_f = formatDate(this.b_creationdate, long);
        this.b_lastedit_f = formatDate(this.b_lastedit, long);
    };
    
    function Post(p_id, b_id, p_title, p_creationdate, p_lastedit, p_content, p_nr_comments){
        this.p_id = p_id;
        this.b_id = b_id;
        this.p_title = p_title;
        this.p_creationdate = p_creationdate;
        this.p_lastedit = p_lastedit;
        this.p_content = p_content;
        this.p_nr_comments = p_nr_comments;
    }
    Post.prototype.setFormatDates = function(long) {
        this.p_creationdate_f = formatDate(this.p_creationdate, long);
        this.p_lastedit_f = formatDate(this.p_lastedit, long);
    };
    
    function Comment(c_id, b_id, p_id, c_author, c_author_url, c_creationdate, c_lastedit, c_content){
        this.c_id = c_id;
        this.b_id = b_id;
        this.p_id = p_id;
        this.c_author = c_author;
        this.c_author_url = c_author_url;
        this.c_creationdate = c_creationdate;
        this.c_lastedit = c_lastedit;
        this.c_content = c_content;
    }
    Comment.prototype.setFormatDates = function(long){
        this.c_creationdate_f = formatDate(this.c_creationdate, long);
        this.c_lastedit_f = formatDate(this.c_lastedit, long);
    };

    // Oeffentliche Methoden
    return {
        // Setter für loggedIn
        setLoggedIn(b){
            loggedIn = b;
        },
        // Getter für loggedIn
        isLoggedIn(){
            return loggedIn;
        },
        // Liefert den angemeldeten Nutzer mit allen Infos
        getSelf(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': 'blogger/v3/users/self'
            });
            // Execute the API request.
            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Blogs des angemeldeten Nutzers
        getAllBlogs(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathGetBlogs
            });
            // Execute the API request.
            request.execute((result) => {
                let blogs_n = [];
                if(result.items !== undefined){
                    for(let item of result.items){
                        blogs_n.push(
                            new Blog(
                                item.id, 
                                item.name, 
                                item.posts.totalItems, 
                                item.published, 
                                item.updated, 
                                item.url
                            )
                        );
                    }
                }
                callback(blogs_n);
            });
        },

        // Liefert den Blog mit der Blog-Id bid
        getBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid
            });
            // Execute the API request.
            request.execute((result) => {
                let blog_n;
                if(result !== undefined){
                    blog_n = new Blog(
                        result.id, 
                        result.name, 
                        result.posts.totalItems, 
                        result.published, 
                        result.updated, 
                        result.url
                    );
                }
                callback(blog_n);
            });
        },

        // Liefert alle Posts zu der  Blog-Id bid
        getAllPostsOfBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts'
            });

            request.execute((result) => {
                let posts_n = [];
                if(result.items !== undefined){
                    for(let item of result.items){
                        posts_n.push(
                            new Post(
                                item.id, 
                                item.blog.id, 
                                item.title, 
                                item.published, 
                                item.updated, 
                                item.content, 
                                item.replies.totalItems
                            )
                        );
                    }
                }
                callback(posts_n);
            });
        },

        // Liefert den Post mit der Post-Id pid im Blog mit der Blog-Id bid
        getPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid
            });

            request.execute((result) => {
                let post_n;
                if(result !== undefined) {
                    post_n = new Post(
                        result.id, 
                        result.blog.id, 
                        result.title, 
                        result.published, 
                        result.updated, 
                        result.content, 
                        result.replies.totalItems
                    );
                }
                callback(post_n);
            });
        },

        // Liefert alle Kommentare zu dem Post mit der Post-Id pid 
        // im Blog mit der Blog-Id bid
        getAllCommentsOfPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid + "/comments"
            });

            request.execute((result) => {
                let comments_n = [];
                if(result.items  !== undefined){
                    for(let item of result.items){
                        comments_n.push(
                            new Comment(
                                item.id, 
                                item.blog.id, 
                                item.post.id, 
                                item.author.displayName, 
                                item.author.url, 
                                item.published, 
                                item.updated, 
                                item.content
                            )
                        );
                    }
                }
                callback(comments_n);
            });
        },

        // Löscht den Kommentar mit der Id cid zu Post mit der Post-Id pid 
        // im Blog mit der Blog-Id bid 
        // Callback wird ohne result aufgerufen
        deleteComment(bid, pid, cid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid + "/comments/" + cid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        },

        // Fügt dem Blog mit der Blog-Id bid einen neuen Post 
        // mit title und content hinzu, Callback wird mit neuem Post aufgerufen
        addNewPost(bid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'POST',
                'path': pathBlogs + "/" + bid + '/posts',
                'body': body
            });

            request.execute(callback);
        },

        // Aktualisiert title und content im geänderten Post 
        // mit der Post-Id pid im Blog mit der Blog-Id bid
        updatePost(bid, pid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                id: pid,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'PUT',
                'path': pathBlogs + "/" + bid + '/posts/' + pid,
                'body': body
            });

            request.execute(callback);
        },

        // Löscht den Post mit der Post-Id pid im Blog mit der Blog-Id bid, 
        // Callback wird ohne result aufgerufen
        deletePost(bid, pid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        }
    };
})();



