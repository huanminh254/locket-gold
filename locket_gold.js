/**
 * Locket Gold Ultra Engine for Shadowrocket
 * Fix 100% full Gold, 30s video, Camera Roll, Views, Icons, Captions, Badge
 */

// ============================================================
// 1. PHA HTTP-REQUEST: XÓA SẠCH ETAG ĐỂ ÉP REVENUECAT TRẢ BODY ĐẦY ĐỦ
// ============================================================
if (typeof $response === "undefined") {
    var headers = $request.headers || {};
    for (var k in headers) {
        if (/^(x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(k)) {
            delete headers[k];
        }
    }
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
    $done({ headers: headers });
}
// ============================================================
// 2. PHA HTTP-RESPONSE: GHI ĐÈ THUÊ BAO GOLD & FIREBASE REMOTE CONFIG
// ============================================================
else {
    var url = ($request && $request.url) ? $request.url.toLowerCase() : "";
    var body = $response.body || "";

    try {
        var obj = JSON.parse(body);

        // A. XỬ LÝ REVENUECAT (api.revenuecat.com)
        if (url.indexOf("revenuecat.com") !== -1) {
            obj.subscriber = obj.subscriber || {};
            obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
            obj.subscriber.entitlements = obj.subscriber.entitlements || {};
            obj.subscriber.subscriber_attributes = obj.subscriber.subscriber_attributes || {};

            var EXPIRES = "2099-12-31T23:59:59Z";
            var PURCHASE = "2022-02-22T22:22:22Z";
            var PID = "com.locket02.premium.yearly";

            var subInfo = {
                is_sandbox: false,
                ownership_type: "PURCHASED",
                billing_issues_detected_at: null,
                period_type: "normal",
                expires_date: EXPIRES,
                grace_period_expires_date: null,
                unsubscribe_detected_at: null,
                original_purchase_date: PURCHASE,
                purchase_date: PURCHASE,
                store: "app_store"
            };

            var entInfo = {
                grace_period_expires_date: null,
                purchase_date: PURCHASE,
                original_purchase_date: PURCHASE,
                product_identifier: PID,
                expires_date: EXPIRES,
                ownership_type: "PURCHASED",
                store: "app_store"
            };

            // Tiêm các gói subscription
            var pids = [PID, "locket_1600_1y", "locket_2400_1y", "locket_3600_1y", "locket_gold_yearly"];
            for (var i = 0; i < pids.length; i++) {
                obj.subscriber.subscriptions[pids[i]] = subInfo;
            }

            // Tiêm toàn bộ các Entitlements để mở khóa tính năng
            var entKeys = [
                "Gold", "gold", "locket_gold", "pro", "plus", "vip", "premium", "all_access",
                "longer_video", "longer_videos", "video_30s", "video_15s", "video_duration", "longer_video_30s",
                "camera_roll", "camera_roll_video", "video_upload", "camera_roll_enabled",
                "views", "read_receipts", "locket_views", "moment_views",
                "app_icon_picker", "app_icons", "custom_app_icons",
                "extended_captions", "long_captions", "captions", "breaking_news",
                "locket_gold_badge", "profile_badge", "gold_badge", "badge", "crown", "gold_crown",
                "custom_widget_frames", "unlimited_friends", "streak_recovery", "ad_free", "no_ads", "remove_ads"
            ];
            for (var j = 0; j < entKeys.length; j++) {
                obj.subscriber.entitlements[entKeys[j]] = entInfo;
            }

            // Tiêm các thuộc tính người dùng
            var nowMs = Date.now();
            var attrs = {
                "locket_gold_badge": "true",
                "locket_gold_badge_small": "true",
                "locket_gold_badge_text": "LOCKET GOLD SINCE 2005",
                "show_gold_badge": "true",
                "gold_badge": "true",
                "gold_crown": "true",
                "crown": "true",
                "badge": "locket_gold",
                "is_gold": "true",
                "longer_video_unlocked": "true",
                "camera_roll_unlocked": "true",
                "views_unlocked": "true",
                "custom_icons_unlocked": "true",
                "long_captions_unlocked": "true",
                "remove_ads_unlocked": "true"
            };
            for (var attrKey in attrs) {
                obj.subscriber.subscriber_attributes[attrKey] = {
                    value: attrs[attrKey],
                    updated_at_ms: nowMs
                };
            }

            // Xử lý offerings nếu có
            if (url.indexOf("offerings") !== -1 && Array.isArray(obj.offerings)) {
                for (var o = 0; o < obj.offerings.length; o++) {
                    if (obj.offerings[o]) {
                        obj.offerings[o].is_gold_activated = true;
                    }
                }
            }

            $done({ body: JSON.stringify(obj) });
        }
        // B. XỬ LÝ FIREBASE REMOTE CONFIG
        else if (url.indexOf("firebaseremoteconfig") !== -1) {
            obj.entries = obj.entries || {};
            obj.entries.moment_max_video_duration = "30";
            obj.entries.video_max_duration = "30";
            obj.entries.maxVideoSeconds = "30";
            obj.entries.uploadVideoMaxSeconds = "30";
            obj.entries.videoTrimMaxSeconds = "30";
            obj.entries.cameraRollVideoMaxLength = "30";
            obj.entries.camera_roll_transcode_video = "true";
            obj.entries.breaking_news_caption_enabled = "true";
            obj.entries.custom_widget_frame_upsell = "false";

            var gates = {};
            try {
                if (obj.entries.feature_gates_override) {
                    gates = JSON.parse(obj.entries.feature_gates_override);
                }
            } catch (err) {
                gates = {};
            }

            gates.longer_video = "enabled";
            gates.video_30s = "enabled";
            gates.camera_roll = "enabled";
            gates.camera_roll_video = "enabled";
            gates.video_upload = "enabled";
            gates.views = "enabled";
            gates.read_receipts = "enabled";
            gates.app_icon_picker = "enabled";
            gates.extended_captions = "enabled";
            gates.long_captions = "enabled";
            gates.locket_gold = "enabled";
            gates.locket_gold_badge = "enabled";
            gates.ad_free = "enabled";

            obj.entries.feature_gates_override = JSON.stringify(gates);
            obj.state = "UPDATE";

            $done({ body: JSON.stringify(obj) });
        }
        else {
            $done({ body: body });
        }
    } catch (e) {
        $done({ body: body });
    }
}
