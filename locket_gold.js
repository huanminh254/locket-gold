/**
 * Locket Gold Universal Engine for Shadowrocket
 * Intercepts & unlocks RevenueCat (api.revenuecat.com) & Firebase Remote Config (firebaseremoteconfig.googleapis.com)
 * Author: huanminh254
 */

const FAR_FUTURE = "9999-01-09T10:10:14Z";
const PAST = "2024-01-01T00:00:00Z";
const PRIMARY_PID = "locket_1600_1y";

// ============================================================
// 1. PHA HTTP-REQUEST: XÓA SẠCH CACHE & ETAG ĐỂ ÉP SERVER TRẢ BODY 200
// ============================================================
if (typeof $response === "undefined") {
    let headers = ($request && $request.headers) ? { ...$request.headers } : {};
    for (const k of Object.keys(headers)) {
        if (/^(x-revenuecat-etag|if-none-match|if-modified-since|etag)$/i.test(k)) {
            delete headers[k];
        }
    }
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
    $done({ headers });
} 
// ============================================================
// 2. PHA HTTP-RESPONSE: GHI ĐÈ REVENUECAT & FIREBASE REMOTE CONFIG
// ============================================================
else {
    const reqUrl = ($request && $request.url) ? $request.url.toLowerCase() : "";
    let bodyStr = (typeof $response.body === "string") ? $response.body : "";

    // ------------------------------------------------------------
    // A. XỬ LÝ REVENUECAT (api.revenuecat.com)
    // ------------------------------------------------------------
    if (reqUrl.includes("revenuecat.com")) {
        try {
            let obj = {};
            try {
                if (bodyStr && bodyStr.trim()) obj = JSON.parse(bodyStr);
            } catch (e) {
                obj = {};
            }

            // A1. Xử lý Product Entitlement Mapping
            if (reqUrl.includes("product_entitlement_mapping")) {
                const allEntList = getAllEntitlementList();
                obj.product_entitlement_mapping = obj.product_entitlement_mapping || {};
                const pids = [
                    "locket_2400_1y", "locket_1600_1y", "locket_3600_1y", "locket_399_1m",
                    "locket_199_1m", "locket_gold_yearly", "locket_gold_annual"
                ];
                for (const pid of pids) {
                    obj.product_entitlement_mapping[pid] = {
                        product_identifier: pid,
                        entitlements: allEntList
                    };
                }
                $done({ status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
            }
            // A2. Xử lý Offerings (Vô hiệu hóa paywall chào mua gói)
            else if (reqUrl.includes("/offerings")) {
                if (Array.isArray(obj.offerings)) {
                    for (const off of obj.offerings) {
                        if (!off || typeof off !== "object") continue;
                        off.is_gold_activated = true;
                        if (off.paywall && off.paywall.config) {
                            off.paywall.config.display_close_button = true;
                            off.paywall.config.dismiss_on_cta = true;
                        }
                    }
                }
                $done({ status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
            } 
            // A3. Xử lý Subscribers & Receipts (Mở khóa toàn bộ tính năng Gold)
            else {
                const nowIso = new Date().toISOString();
                const nowMs = Date.now();

                obj.request_date = nowIso;
                obj.request_date_ms = nowMs;
                obj.subscriber = obj.subscriber || {};

                const sub = obj.subscriber;
                sub.original_app_user_id = sub.original_app_user_id || "70B24288-83C4-4035-B001-573285B21AE2";
                sub.first_seen = PAST;
                sub.last_seen = nowIso;
                sub.original_application_version = "9692";
                sub.original_purchase_date = PAST;
                sub.management_url = "https://apps.apple.com/account/subscriptions";
                sub.other_purchases = sub.other_purchases || {};
                sub.non_subscriptions = sub.non_subscriptions || {};
                sub.subscriptions = sub.subscriptions || {};
                sub.entitlements = sub.entitlements || {};
                sub.subscriber_attributes = sub.subscriber_attributes || {};

                const buildSub = (pid) => ({
                    auto_resume_date: null,
                    display_name: pid,
                    is_sandbox: false,
                    ownership_type: "PURCHASED",
                    billing_issues_detected_at: null,
                    management_url: "https://apps.apple.com/account/subscriptions",
                    period_type: "normal",
                    price: { amount: 399000.0, currency: "VND" },
                    expires_date: FAR_FUTURE,
                    grace_period_expires_date: null,
                    refunded_at: null,
                    unsubscribe_detected_at: null,
                    original_purchase_date: PAST,
                    purchase_date: PAST,
                    store: "app_store",
                    store_transaction_id: "2000001108724193"
                });

                const buildEnt = (pid) => ({
                    grace_period_expires_date: null,
                    purchase_date: PAST,
                    original_purchase_date: PAST,
                    product_identifier: pid,
                    product_plan_identifier: pid,
                    expires_date: FAR_FUTURE,
                    ownership_type: "PURCHASED",
                    store: "app_store",
                    store_transaction_id: "2000001108724193"
                });

                // Các gói subscription chính
                const allPids = [
                    "locket_2400_1y", "locket_1600_1y", "locket_3600_1y", "locket_399_1m",
                    "locket_199_1m", "locket_gold_yearly", "locket_gold_annual", "locket_gold_monthly",
                    "gold", "locket_gold", "locket_gold_v2", "locket_sub_1y", "locket_sub_1m"
                ];

                for (const pid of allPids) {
                    sub.subscriptions[pid] = buildSub(pid);
                }

                // Tiêm toàn bộ 193 Entitlement của Locket
                const allEnts = getAllEntitlementList();
                for (const ent of allEnts) {
                    sub.entitlements[ent] = buildEnt(PRIMARY_PID);
                }

                // Tiêm toàn bộ Subscriber Attributes nội bộ
                const attrs = {
                    "locket_gold_badge": "true",
                    "locket_gold_badge_small": "true",
                    "locket_gold_badge_text": "LOCKET GOLD SINCE 2005",
                    "locket_gold_since": PAST,
                    "show_gold_badge": "true",
                    "gold_badge": "true",
                    "gold_crown": "true",
                    "crown": "true",
                    "locket_verified": "true",
                    "verified": "true",
                    "badge": "locket_gold",
                    "profile_badge": "locket_gold",
                    "locket_badge": "locket_gold",
                    "subscription_entitlement": "locket_gold",
                    "is_gold": "true",
                    "longer_video_unlocked": "true",
                    "camera_roll_unlocked": "true",
                    "views_unlocked": "true",
                    "custom_icons_unlocked": "true",
                    "long_captions_unlocked": "true",
                    "remove_ads_unlocked": "true",
                    "ai_looks_unlocked": "true",
                    "ai_filter_quota": "999999",
                    "ai_filter_remaining": "999999"
                };

                for (const [k, v] of Object.entries(attrs)) {
                    sub.subscriber_attributes[k] = { value: v, updated_at_ms: nowMs };
                }

                $done({ status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
            }
        } catch (e) {
            $done({});
        }
    }
    // ------------------------------------------------------------
    // B. XỬ LÝ FIREBASE REMOTE CONFIG (firebaseremoteconfig.googleapis.com)
    // ------------------------------------------------------------
    else if (reqUrl.includes("firebaseremoteconfig.googleapis.com")) {
        try {
            let obj = {};
            try {
                if (bodyStr && bodyStr.trim()) obj = JSON.parse(bodyStr);
            } catch (e) {
                obj = {};
            }

            obj.entries = obj.entries || {};
            
            // 1. Mở khóa thời lượng video 30s tối đa
            obj.entries.moment_max_video_duration = "30";
            obj.entries.video_max_duration = "30";
            obj.entries.maxVideoSeconds = "30";
            obj.entries.uploadVideoMaxSeconds = "30";
            obj.entries.videoTrimMaxSeconds = "30";
            obj.entries.videoTrimmerDuration = "30";
            obj.entries.cameraRollVideoMaxLength = "30";
            obj.entries.camera_roll_video_max_length = "30";
            obj.entries.cameraRollTrimMaxDuration = "30";
            obj.entries.video_trimmer_max_duration_seconds = "30";
            obj.entries.media_picker_duration_seconds = "30";
            obj.entries.camera_roll_transcode_video = "true";

            // 2. Mở khóa caption dài & tắt upsell quảng cáo
            obj.entries.breaking_news_caption_enabled = "true";
            obj.entries.custom_widget_frame_upsell = "false";
            obj.entries.help_center = "true";
            obj.entries.calendar_delete_moment_enabled = "true";
            obj.entries.holiday_effects_free = "true";

            // 3. Ghi đè feature_gates_override
            let gates = {};
            try {
                if (obj.entries.feature_gates_override) {
                    gates = JSON.parse(obj.entries.feature_gates_override);
                }
            } catch (e) {
                gates = {};
            }

            const overrideGates = {
                "longer_video": "enabled",
                "video_30s": "enabled",
                "camera_roll": "enabled",
                "camera_roll_video": "enabled",
                "video_upload": "enabled",
                "views": "enabled",
                "read_receipts": "enabled",
                "app_icon_picker": "enabled",
                "extended_captions": "enabled",
                "long_captions": "enabled",
                "locket_gold": "enabled",
                "locket_gold_badge": "enabled",
                "custom_widget_frames": "enabled",
                "unlimited_friends": "enabled",
                "streak_recovery": "enabled",
                "ad_free": "enabled",
                "no_ads": "enabled",
                "camera_theme": "enabled"
            };

            for (const [k, v] of Object.entries(overrideGates)) {
                gates[k] = v;
            }

            obj.entries.feature_gates_override = JSON.stringify(gates);
            obj.state = "UPDATE";

            $done({ status: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
        } catch (e) {
            $done({});
        }
    } 
    else {
        $done({});
    }
}

// ============================================================
// DANH SÁCH 193 ENTITLEMENT KEYS ĐẦY ĐỦ CỦA LOCKET
// ============================================================
function getAllEntitlementList() {
    return [
        "Gold", "gold", "locket_gold", "pro", "plus", "vip", "premium", "all_access",
        "filters", "filter", "Filters", "Filter", "camera_filters", "camera_filter",
        "all_filters", "all_filters_free", "effects", "effect_pack_10", "effect_pack_20",
        "filter_pack_10", "filter_pack_20", "filter_pack", "holiday_effects", "holiday_filters",
        "holiday_filter", "holiday_effect", "holiday", "holidays", "holiday_moments",
        "view_holiday_moments", "seasonal_effects", "seasonal_frames", "camera_filter_holidays",
        "camera_filter_sheet", "holiday_effects_unlocked", "holiday_filters_unlocked",
        "holiday_filter_unlocked", "holiday_effect_unlocked", "ai_filters", "ai_filter",
        "custom_filters", "custom_filter", "video", "video_upload", "camera_roll_video",
        "extended_video", "longer_video", "longer_videos", "video_15s", "video_30s",
        "video_duration", "longer_video_30s", "camera_roll_video_30s", "video_upload_30s",
        "upload_video_30s", "upload_video", "longer_video_upload", "extended_video_upload",
        "upload_longer_video", "upload_extended_video", "camera_roll_longer_video",
        "camera_roll_extended_video", "camera_roll_30s", "camera_roll_15s", "allow_30s_video",
        "allow_longer_video", "30s_video", "30s_video_upload", "30s_camera_roll", "video_trim",
        "video_trimming", "video_trimmer", "camera_roll_trim", "camera_roll_video_trim",
        "gallery_video", "gallery_video_30s", "gallery_upload", "library_video",
        "library_video_30s", "photo_library_video", "photo_library_video_30s", "gold_camera_roll",
        "gold_camera_roll_video", "gold_video_upload", "gold_video_30s", "gold_video_15s",
        "gold_longer_video", "gold_extended_video", "captions", "caption", "custom_captions",
        "custom_caption", "extended_captions", "extended_caption", "long_captions", "long_caption",
        "dynamic_captions", "dynamic_caption", "caption_styles", "caption_icons", "caption_options",
        "caption_prompts", "zodiac_captions", "holiday_captions", "quote_captions", "breaking_news",
        "breaking_news_caption", "color_palette", "music_caption", "link_caption", "poll_caption",
        "weather_caption", "location_caption", "time_caption", "review_caption", "streak_caption",
        "locket_count_caption", "unlimited_captions", "all_captions", "all_overlays", "overlays",
        "overlay", "overlay_picker", "overlay_items", "overlay_navigator", "music", "poll", "links",
        "link", "comments", "comment", "rollcall", "private_mode", "viewer_mode", "private_viewing",
        "close_friends", "best_friends", "privacy", "unlimited_friends", "custom_widget_frames",
        "widget_frames", "custom_frames", "widget_frame", "frames", "custom_widget_frame", "widget",
        "widgets", "streak_recovery", "streakRecovery", "app_icon_picker", "app_icons",
        "custom_app_icons", "app_icon", "camera_roll", "camera_roll_enabled", "camera_theme",
        "camera_themes", "themes", "theme", "locket_views", "moment_views", "locket_view",
        "moment_view", "profile_badge", "profileBadge", "gold_since_badge", "goldSinceBadge",
        "gold_badge_profile_menu", "gold_badge", "badge", "crown", "gold_crown", "crown_badge",
        "gold_profile_badge", "profile_gold_badge", "gold_crown_badge", "vip_badge",
        "subscriber_badge", "membership_badge", "gold_member", "gold_status",
        "profile_badge_enabled", "badge_enabled", "gold_badge_enabled", "locket_badge",
        "locket_crown", "locket_gold_badge", "remove_ads", "groups", "qr_code", "user_qr",
        "qr_user", "hd_upload"
    ];
}
