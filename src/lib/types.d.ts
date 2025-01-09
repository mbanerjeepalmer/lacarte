export interface Piece {
    id: string;
    title: string;
    url: string;
    topics?: string[];
    tone?: number;  // 0.0 = whimsical, 1.0 = serious
    topicProjection?: number;  // 0.0 to 1.0, projection of topic similarity into 1D
    published_utc: string;
    subreddit?: string;
    source?: string;
}

export interface RedditPreview {
    images: {
        source: {
            url: string;
            width: number;
            height: number;
        };
        resolutions: {
            url: string;
            width: number;
            height: number;
        }[];
        variants: Record<string, any>;
        id: string;
    }[];
    enabled: boolean;
}

export interface RedditPost {
    data: {
        approved_at_utc: null | number;
        subreddit: string;
        selftext: string;
        author_fullname: string;
        saved: boolean;
        mod_reason_title: null | string;
        gilded: number;
        clicked: boolean;
        title: string;
        link_flair_richtext: any[];
        subreddit_name_prefixed: string;
        hidden: boolean;
        pwls: number;
        link_flair_css_class: string | null;
        downs: number;
        thumbnail_height: number | null;
        top_awarded_type: null | string;
        hide_score: boolean;
        name: string;
        quarantine: boolean;
        link_flair_text_color: string | null;
        upvote_ratio: number;
        author_flair_background_color: string | null;
        subreddit_type: string;
        ups: number;
        total_awards_received: number;
        thumbnail_width: number | null;
        is_original_content: boolean;
        secure_media: null | any;
        is_reddit_media_domain: boolean;
        is_meta: boolean;
        category: null | string;
        link_flair_text: string | null;
        can_mod_post: boolean;
        score: number;
        approved_by: null | string;
        is_created_from_ads_ui: boolean;
        author_premium: boolean;
        thumbnail: string;
        edited: boolean | number;
        author_flair_css_class: string | null;
        gildings: Record<string, number>;
        post_hint?: string;
        content_categories: null | string[];
        is_self: boolean;
        mod_note: null | string;
        created: number;
        link_flair_type: string;
        wls: number;
        removed_by_category: null | string;
        banned_by: null | string;
        domain: string;
        allow_live_comments: boolean;
        selftext_html: null | string;
        likes: null | boolean;
        suggested_sort: null | string;
        banned_at_utc: null | number;
        url_overridden_by_dest?: string;
        view_count: null | number;
        archived: boolean;
        no_follow: boolean;
        is_crosspostable: boolean;
        pinned: boolean;
        over_18: boolean;
        preview?: RedditPreview;
        all_awardings: any[];
        awarders: any[];
        media_only: boolean;
        can_gild: boolean;
        spoiler: boolean;
        locked: boolean;
        treatment_tags: string[];
        visited: boolean;
        removed_by: null | string;
        num_reports: null | number;
        distinguished: null | string;
        subreddit_id: string;
        author_is_blocked: boolean;
        mod_reason_by: null | string;
        removal_reason: null | string;
        link_flair_background_color: string | null;
        id: string;
        is_robot_indexable: boolean;
        report_reasons: null | string[];
        author: string;
        discussion_type: null | string;
        num_comments: number;
        send_replies: boolean;
        contest_mode: boolean;
        author_patreon_flair: boolean;
        permalink: string;
        stickied: boolean;
        url: string;
        subreddit_subscribers: number;
        created_utc: number;
        num_crossposts: number;
        media: null | any;
        is_video: boolean;
    }
}