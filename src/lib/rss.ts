import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL:string){
  const res = await fetch(feedURL,{
    headers: {
      "User-Agent": "gator",
    },
  })

  if(!res.ok){
    throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const data = await res.text()

  const parser = new XMLParser({
    processEntities: false,
  });

  const parsedData = parser.parse(data);
  if(!parsedData.rss){
    throw new Error("Invalid RSS feed")
  }

  if(!parsedData.rss.channel ){
    throw new Error("Invalid RSS feed")
  }

  const channel = parsedData.rss.channel;

  if (!channel.title || typeof channel.title !== "string"){
    throw new Error("Invalid RSS feed")
  } 
  const title = channel.title;

  if (!channel.description || typeof channel.description !== "string"){
    throw new Error("Invalid RSS feed")
  } 
  const description = channel.description;

  if (!channel.link || typeof channel.link !== "string"){
    throw new Error("Invalid RSS feed")
  } 
  const link = channel.link;

  let items = [];

  if (channel.item) {
    if (Array.isArray(channel.item)) {
      items = channel.item;
    } else {
      items = [channel.item];
    }
  }
  const RSSItems: RSSItem[] = [];
  items.forEach((item: any) => {
    if (
      typeof item.title !== "string" ||
      typeof item.link !== "string" ||
      typeof item.description !== "string" ||
      typeof item.pubDate !== "string" 
    ) {
      return;
    }
    RSSItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate
    })
  })
  
  const rssFeed: RSSFeed = {
    channel: {
      title: title,
      link: link,
      description: description,
      item: RSSItems
    },
  };
  return rssFeed;

}