import { TSGhostContentAPI, type Page, type Post } from "@ts-ghost/content-api";
import * as fs from 'fs';
import sanitizeHtml from 'sanitize-html';
import "dotenv/config";

// SETUP GHOST API
const ghostApiKey = process.env.GHOST_API_KEY!;
const ghostUrl = process.env.GHOST_URL!;
const version = "v5.0";
const api = new TSGhostContentAPI(ghostUrl, ghostApiKey, version);

export const getSettings = async() =>{
	let settings = await api.settings.fetch();
	if(settings.success)
	{
		let file = "./src/siteSettings.json";
		let content = JSON.stringify(settings.data);
		fs.writeFileSync(file, content);
	}
}


export const getAllBlogs = async() => {
	const posts: Post[] = [];

	let cursor = await api.posts
		.browse()
		.include({
			authors: true,
			tags: true,
		})
		.paginate();
	if (cursor.current.success) posts.push(...cursor.current.data);
	while (cursor.next) {
		cursor = await cursor.next.paginate();
		if (cursor.current.success) posts.push(...cursor.current.data);
	}

	var nextPostSlug = "";
	var prevPostSlug = posts[posts.length - 1].slug;
	
	for(var i=0; i <=posts.length - 1; i++)
		{
			var post = posts[i] as Post;
			var nextPost = posts[i+1];
			if(nextPost !== undefined)
			{
				nextPostSlug = nextPost.slug;
			}

			if(i == posts.length - 1)
			{
				nextPostSlug = posts[0].slug;
			}

			if(post !== undefined){
				let url = post.url.replace(ghostUrl, "");
				url = url.replace(String.fromCharCode(47), "", );
				url = url.replace(String.fromCharCode(47), "", );

				url = post.slug;

				let cleanHtml = sanitizeHtml(post.html, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'ul', 'li' ]),
					allowedAttributes: false,
					allowedClasses: {
						"*": false
					}
				});
				
				let file = "./src/content/blog/" + url + ".mdx";
				console.log(file);
				//console.log(page);
				let content = "---\ntitle: " + post.title;
				content += "\ndescription: " + (post.meta_description ?? "none");
				content += "\npubDate: " + post.updated_at;
				content += "\nheroImage: " + (post.feature_image ?? "none");
				content += "\nexcerpt: " + (post.excerpt ?? "No post excerpt was given.").replace(/(\r\n|\n|\r)/gm, "");
				content += "\nauthor: " + (post.authors![0].name ?? "Unknown");
				content += "\nminRead: " + (post.reading_time + " min" ?? "Unknown");
				content += "\nnextPost: " + nextPostSlug;
				content += "\nprevPost: " + prevPostSlug;
				content += "\n---\n" + cleanHtml;
	
				//remove ghost comments
				content = content.replace("<!--kg-card-begin: html-->", "");
				content = content.replace("<!--kg-card-end: html-->", "");
				
				//console.log(content);
				fs.writeFileSync(file, content);
				prevPostSlug = post.slug;
			}
		}
}

export const getAllPages = async () => {
	const pages: Page[] = [];
	let cursor = await api.pages
		.browse()
		.include({
			authors: true,
			tags: true,
		})
		.paginate();
	if (cursor.current.success) pages.push(...cursor.current.data);
	while (cursor.next) {
		cursor = await cursor.next.paginate();
		if (cursor.current.success) pages.push(...cursor.current.data);
	}
    
    for(var i=0; i <=pages.length; i++)
    {
        var page = pages[i] as Page;
        if(page !== undefined){
            let url = page.url.replace(ghostUrl, "");
            url = url.replace(String.fromCharCode(47), "", );
			url = url.replace(String.fromCharCode(47), "", );
            
            let file = "./src/content/page/" + url + ".mdx";
			console.log(file);

			let cleanHtml = sanitizeHtml(page.html, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'ul', 'li' ]),
				allowedAttributes: false,
				allowedClasses: {
					"*": false
				}
			});
			
			//console.log(page);
			let content = "---\ntitle: " + page.title;
			content += "\ndescription: " + (page.meta_description ?? "none");
			content += "\npubDate: " + new Date(page.published_at).toLocaleDateString();
			content += "\nheroImage: " + (page.feature_image ?? "none");
			content += "\n---\n\n" + cleanHtml;

			//remove ghost comments
			content = content.replace("<!--kg-card-begin: html-->", "");
			content = content.replace("<!--kg-card-end: html-->", "");
			
			//console.log(content);
            fs.writeFileSync(file, content);
        }
    }
};