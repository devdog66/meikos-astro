import { defineCollection, z} from 'astro:content';

const blogCollection = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		excerpt: z.string().optional(),
		author: z.string().optional(),
		minRead: z.string().optional(),
		nextPost: z.string().optional(),
		prevPost: z.string().optional()
	})
});

const pageCollection = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	})
});

export const collections = { "blog": blogCollection, "page": pageCollection};
