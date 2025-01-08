export interface Piece {
    id: string;
    title: string;
    url: string;
    topics: string[];
    tone: number;  // 0.0 = whimsical, 1.0 = serious
    topicProjection: number;  // 0.0 to 1.0, projection of topic similarity into 1D
    published: string;
    subreddit: string;
}

// Mock data derived from the Reddit feed
export const pieces: Piece[] = [
    {
        id: "t3_1hvl1iy",
        title: "UK retailers may have to cut thousands of jobs after bleak Christmas",
        url: "https://www.theguardian.com/business/2025/jan/07/uk-retailers-cut-jobs-christmas-sales-growth-card-spending",
        topics: ["business", "retail", "economy", "uk news"],
        tone: 0.9,
        topicProjection: 0.8,  // Business/economy cluster
        published: "2025-01-07T06:08:20+00:00",
        subreddit: "unitedkingdom"
    },
    {
        id: "t3_1hvkuyi",
        title: "Mental health: Children should be more resilient, say experts",
        url: "https://www.bbc.co.uk/news/articles/c4gp19n111vo",
        topics: ["health", "mental health", "children", "uk news"],
        tone: 0.85,
        topicProjection: 0.6,  // Health/society cluster
        published: "2025-01-07T05:56:57+00:00",
        subreddit: "unitedkingdom"
    },
    {
        id: "t3_1hv2evf",
        title: "Got back to work today, management have put this up in the tea room. What type of year am I in for?",
        url: "https://i.redd.it/32l3s7ivcebe1.jpeg",
        topics: ["humor", "work life", "british culture"],
        tone: 0.2,
        topicProjection: 0.3,  // Culture/lifestyle cluster
        published: "2025-01-06T16:04:05+00:00",
        subreddit: "CasualUK"
    },
    {
        id: "t3_1hvhra1",
        title: "Professor thinks I'm dishonest because her AI \"tool\" flagged my assignment as AI generated, which it isn't…",
        url: "https://i.redd.it/rsq8zsshlhbe1.jpeg",
        topics: ["education", "ai", "technology", "academia"],
        tone: 0.7,
        topicProjection: 0.5,  // Technology/education cluster
        published: "2025-01-07T03:03:58+00:00",
        subreddit: "mildlyinfuriating"
    },
    {
        id: "t3_1hvl8ot",
        title: "Bro is diabolical.",
        url: "https://v.redd.it/47hfy1xslibe1",
        topics: ["humor", "memes"],
        tone: 0.1,
        topicProjection: 0.2,  // Entertainment/memes cluster
        published: "2025-01-07T06:21:17+00:00",
        subreddit: "SipsTea"
    },
    {
        id: "t3_1hvmp05",
        title: "So what's the stupidest thing you've already done this morning?",
        url: "https://www.reddit.com/r/CasualUK/comments/1hvmp05/so_whats_the_stupidest_thing_youve_already_done/",
        topics: ["humor", "british culture", "daily life"],
        tone: 0.15,
        topicProjection: 0.3,  // Culture/lifestyle cluster
        published: "2025-01-07T08:05:15+00:00",
        subreddit: "CasualUK"
    },
    {
        id: "t3_1hvnsbw",
        title: "Have been offered a flat at below market rate, but my partner is not \"allowed\" to go on the mortgage, what are my options?",
        url: "https://www.reddit.com/r/UKPersonalFinance/comments/1hvnsbw/have_been_offered_a_flat_at_below_market_rate_but/",
        topics: ["finance", "property", "relationships", "advice"],
        tone: 0.8,
        topicProjection: 0.7,  // Finance/property cluster
        published: "2025-01-07T09:29:50+00:00",
        subreddit: "UKPersonalFinance"
    },
    {
        id: "t3_1hvdy48",
        title: "Live WWE Raw Discussion Thread - January 06, 2025!",
        url: "https://www.reddit.com/r/SquaredCircle/comments/1hvdy48/live_wwe_raw_discussion_thread_january_06_2025/",
        topics: ["wrestling", "entertainment", "live discussion"],
        tone: 0.4,
        topicProjection: 0.2,  // Entertainment cluster
        published: "2025-01-07T00:00:57+00:00",
        subreddit: "SquaredCircle"
    },
    {
        id: "t3_1hvcx6v",
        title: "Picture of Naima Jamal, an Ethiopian woman currently being held and auctioned as a slave in Libya",
        url: "https://www.reddit.com/r/pics/comments/1hvcx6v/picture_of_naima_jamal_an_ethiopian_woman/",
        topics: ["news", "human rights", "africa", "current events"],
        tone: 1.0,
        topicProjection: 0.9,  // Serious news/human rights cluster
        published: "2025-01-06T23:14:58+00:00",
        subreddit: "pics"
    },
    {
        id: "t3_1hvofl7",
        title: "GenXers. Are you fed up of being called Boomers?",
        url: "https://www.reddit.com/r/AskUK/comments/1hvofl7/genxers_are_you_fed_up_of_being_called_boomers/",
        topics: ["society", "generations", "discussion"],
        tone: 0.5,
        topicProjection: 0.4,  // Society/culture cluster
        published: "2025-01-07T10:20:04+00:00",
        subreddit: "AskUK"
    },
    {
        id: "t3_1hvh7be",
        title: "Nancy Pelosi, 84, using a walker during election certification.",
        url: "https://www.reddit.com/r/pics/comments/1hvh7be/nancy_pelosi_84_using_a_walker_during_election/",
        topics: ["politics", "us politics", "current events"],
        tone: 0.7,
        topicProjection: 0.8,  // Politics/news cluster
        published: "2025-01-07T02:35:08+00:00",
        subreddit: "pics"
    },
    {
        id: "t3_1hvm6en",
        title: "If you can learn how to pronounce Grzegorz Brzęczyszczykiewicz, you can learn how to pronounce SungWon",
        url: "https://www.reddit.com/r/CuratedTumblr/comments/1hvm6en/if_you_can_learn_how_to_pronounce_grzegorz/",
        topics: ["humor", "language", "culture"],
        tone: 0.3,
        topicProjection: 0.3,  // Culture/humor cluster
        published: "2025-01-07T07:26:27+00:00",
        subreddit: "CuratedTumblr"
    },
    {
        id: "t3_1hvloxr",
        title: "What is life like in the UK for expats?",
        url: "https://www.reddit.com/r/AskUK/comments/1hvloxr/what_is_life_like_in_the_uk_for_expats/",
        topics: ["immigration", "advice", "uk life"],
        tone: 0.6,
        topicProjection: 0.5,  // Society/lifestyle cluster
        published: "2025-01-07T06:52:00+00:00",
        subreddit: "AskUK"
    },
    {
        id: "t3_1hvmcza",
        title: "Just so we're all clear",
        url: "https://www.reddit.com/r/BrexitMemes/comments/1hvmcza/just_so_were_all_clear/",
        topics: ["politics", "brexit", "humor"],
        tone: 0.2,
        topicProjection: 0.7,  // Politics cluster but humorous
        published: "2025-01-07T07:40:15+00:00",
        subreddit: "BrexitMemes"
    },
    {
        id: "t3_1hvdbjo",
        title: "How do you feel safe walking home at night?",
        url: "https://www.reddit.com/r/AskUK/comments/1hvdbjo/how_do_you_feel_safe_walking_home_at_night/",
        topics: ["safety", "advice", "urban life"],
        tone: 0.8,
        topicProjection: 0.5,  // Society/safety cluster
        published: "2025-01-06T23:32:44+00:00",
        subreddit: "AskUK"
    }
]; 