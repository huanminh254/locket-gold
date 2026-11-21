/**
 * Locket Gold Ultra Engine for Shadowrocket
 * 100% Full Gold Unlocked:
 * 1. 30s Video Recording (moment_max_video_duration = 30)
 * 2. Camera Roll / Gallery Video Upload (camera_roll = enabled)
 * 3. Read Receipts / View Count (views, read_receipts = enabled)
 * 4. Custom App Icons (app_icon_picker = enabled)
 * 5. Extended Captions (extended_captions, long_captions = enabled)
 * 6. Locket Gold Crown & Profile Badge (locket_gold_badge = enabled)
 * 7. Ad-Free & Remove Upsell Popups (ad_free = enabled, paywall disabled)
 *
 * Wrapped in IIFE to prevent variable re-declaration errors in Shadowrocket worker threads.
 */

(function () {
    // ============================================================
    // 1. PHA HTTP-REQUEST: XÓA SẠCH ETAG ĐỂ ÉP SERVER TRẢ 200 OK ĐẦY ĐỦ
    // ============================================================
    if (typeof $response === "undefined") {
        var reqHeaders = ($request && $request.headers) ? $request.headers : {};
        var cleanedHeaders = {};
        for (var h in reqHeaders) {
            if (!/^(x-revenuecat-etag|if-none-match|if-modified-since|etag)$/i.test(h)) {
                cleanedHeaders[h] = reqHeaders[h];
            }
        }
        cleanedHeaders["Cache-Control"] = "no-cache, no-store, must-revalidate";
        cleanedHeaders["Pragma"] = "no-cache";
        $done({ headers: cleanedHeaders });
        return;
    }

    // ============================================================
    // 2. PHA HTTP-RESPONSE: GHI ĐÈ THUÊ BAO GOLD & FIREBASE REMOTE CONFIG
    // ============================================================
    var reqUrl = ($request && $request.url) ? $request.url.toLowerCase() : "";
    var respBody = $response.body || "";

    try {
        // A. XỬ LÝ REVENUECAT (api.revenuecat.com)
        if (reqUrl.indexOf("revenuecat.com") !== -1) {
            var rcObj = {};
            try {
                if (respBody && respBody.trim()) {
                    rcObj = JSON.parse(respBody);
                }
            } catch (parseErr) {
                rcObj = {};
            }

            var EXPIRES_DATE = "2099-12-31T23:59:59Z";
            var PURCHASE_DATE = "2022-02-22T22:22:22Z";
            var MAIN_PID = "com.locket02.premium.yearly";

            var allEntitlements = [
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

            // A1. Xử lý Product Entitlement Mapping
            if (reqUrl.indexOf("product_entitlement_mapping") !== -1) {
                var mappingPids = [
                    MAIN_PID, "locket_1600_1y", "locket_2400_1y", "locket_3600_1y",
                    "locket_399_1m", "locket_199_1m", "locket_gold_yearly", "locket_gold_annual"
                ];
                rcObj.product_entitlement_mapping = rcObj.product_entitlement_mapping || {};
                for (var m = 0; m < mappingPids.length; m++) {
                    rcObj.product_entitlement_mapping[mappingPids[m]] = {
                        product_identifier: mappingPids[m],
                        entitlements: allEntitlements
                    };
                }
                $done({ body: JSON.stringify(rcObj) });
                return;
            }

            // A2. Xử lý Offerings (Tắt paywall ép mua)
            if (reqUrl.indexOf("offerings") !== -1 && Array.isArray(rcObj.offerings)) {
                for (var o = 0; o < rcObj.offerings.length; o++) {
                    if (rcObj.offerings[o]) {
                        rcObj.offerings[o].is_gold_activated = true;
                        if (rcObj.offerings[o].paywall && rcObj.offerings[o].paywall.config) {
                            rcObj.offerings[o].paywall.config.display_close_button = true;
                            rcObj.offerings[o].paywall.config.dismiss_on_cta = true;
                        }
                    }
                }
            }

            // A3. Xử lý Subscribers & Receipts
            var nowIso = new Date().toISOString();
            var nowMs = Date.now();

            rcObj.request_date = nowIso;
            rcObj.request_date_ms = nowMs;
            rcObj.subscriber = rcObj.subscriber || {};

            var sub = rcObj.subscriber;
            sub.original_app_user_id = sub.original_app_user_id || "70B24288-83C4-4035-B001-573285B21AE2";
            sub.first_seen = PURCHASE_DATE;
            sub.last_seen = nowIso;
            sub.original_application_version = "9692";
            sub.original_purchase_date = PURCHASE_DATE;
            sub.management_url = "https://apps.apple.com/account/subscriptions";
            sub.other_purchases = sub.other_purchases || {};
            sub.non_subscriptions = sub.non_subscriptions || {};
            sub.subscriptions = sub.subscriptions || {};
            sub.entitlements = sub.entitlements || {};
            sub.subscriber_attributes = sub.subscriber_attributes || {};

            var subPayload = {
                is_sandbox: false,
                ownership_type: "PURCHASED",
                billing_issues_detected_at: null,
                period_type: "normal",
                expires_date: EXPIRES_DATE,
                grace_period_expires_date: null,
                unsubscribe_detected_at: null,
                original_purchase_date: PURCHASE_DATE,
                purchase_date: PURCHASE_DATE,
                store: "app_store",
                store_transaction_id: "2000001108724193"
            };

            var entPayload = {
                grace_period_expires_date: null,
                purchase_date: PURCHASE_DATE,
                original_purchase_date: PURCHASE_DATE,
                product_identifier: MAIN_PID,
                product_plan_identifier: MAIN_PID,
                expires_date: EXPIRES_DATE,
                ownership_type: "PURCHASED",
                store: "app_store",
                store_transaction_id: "2000001108724193"
            };

            // Tiêm các Subscription PIDs
            var allPids = [
                MAIN_PID, "locket_1600_1y", "locket_2400_1y", "locket_3600_1y", "locket_399_1m", "locket_199_1m",
                "gold", "locket_gold", "locket_gold_v2", "locket_gold_1y", "locket_gold_1m",
                "locket_gold_yearly", "locket_gold_annual", "locket_gold_monthly"
            ];
            for (var p = 0; p < allPids.length; p++) {
                sub.subscriptions[allPids[p]] = subPayload;
            }

            // Tiêm toàn bộ Entitlements
            for (var e = 0; e < allEntitlements.length; e++) {
                sub.entitlements[allEntitlements[e]] = entPayload;
            }

            // Tiêm toàn bộ Subscriber Attributes
            var attrs = {
                "locket_gold_badge": "true",
                "locket_gold_badge_small": "true",
                "locket_gold_badge_text": "LOCKET GOLD SINCE 2005",
                "locket_gold_since": PURCHASE_DATE,
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

            for (var aKey in attrs) {
                sub.subscriber_attributes[aKey] = {
                    value: attrs[aKey],
                    updated_at_ms: nowMs
                };
            }

            $done({ body: JSON.stringify(rcObj) });
            return;
        }

        // B. XỬ LÝ FIREBASE REMOTE CONFIG (firebaseremoteconfig.googleapis.com)
        if (reqUrl.indexOf("firebaseremoteconfig") !== -1) {
            var fbObj = {};
            try {
                if (respBody && respBody.trim()) {
                    fbObj = JSON.parse(respBody);
                }
            } catch (fbErr) {
                fbObj = {};
            }

            fbObj.entries = fbObj.entries || {};

            // 1. Mở khóa thời lượng video 30s tối đa
            fbObj.entries.moment_max_video_duration = "30";
            fbObj.entries.video_max_duration = "30";
            fbObj.entries.maxVideoSeconds = "30";
            fbObj.entries.uploadVideoMaxSeconds = "30";
            fbObj.entries.videoTrimMaxSeconds = "30";
            fbObj.entries.videoTrimmerDuration = "30";
            fbObj.entries.cameraRollVideoMaxLength = "30";
            fbObj.entries.camera_roll_video_max_length = "30";
            fbObj.entries.cameraRollTrimMaxDuration = "30";
            fbObj.entries.video_trimmer_max_duration_seconds = "30";
            fbObj.entries.media_picker_duration_seconds = "30";
            fbObj.entries.camera_roll_transcode_video = "true";

            // 2. Mở khóa caption dài & giao diện VIP
            fbObj.entries.breaking_news_caption_enabled = "true";
            fbObj.entries.custom_widget_frame_upsell = "false";
            fbObj.entries.help_center = "true";
            fbObj.entries.calendar_delete_moment_enabled = "true";
            fbObj.entries.holiday_effects_free = "true";

            // 3. Ghi đè feature_gates_override
            var gates = {};
            try {
                if (fbObj.entries.feature_gates_override) {
                    gates = JSON.parse(fbObj.entries.feature_gates_override);
                }
            } catch (gateErr) {
                gates = {};
            }

            var overrideGates = {
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

            for (var gKey in overrideGates) {
                gates[gKey] = overrideGates[gKey];
            }

            fbObj.entries.feature_gates_override = JSON.stringify(gates);
            fbObj.state = "UPDATE";

            $done({ body: JSON.stringify(fbObj) });
            return;
        }

        // CÁC URL KHÁC
        $done({ body: respBody });
    } catch (globalErr) {
        $done({ body: respBody });
    }
})();
