import Capacitor
import WidgetKit

// Plugin Capacitor pour partager les cartes avec le Widget iOS
// L'App Group "group.com.memoflashcards.app" doit être activé dans Xcode
// pour la target principale ET la target widget.

@objc(WidgetDataPlugin)
public class WidgetDataPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetDataPlugin"
    public let jsName = "WidgetData"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updateCards", returnType: CAPPluginReturnPromise),
    ]

    private let appGroupId = "group.com.memoflashcards.app"
    private let storageKey = "widgetCards"

    @objc func updateCards(_ call: CAPPluginCall) {
        guard let cards = call.getArray("cards") else {
            call.reject("Missing cards array")
            return
        }

        guard let defaults = UserDefaults(suiteName: appGroupId) else {
            call.reject("App Group not configured. Enable 'group.com.memoflashcards.app' in Xcode Signing & Capabilities.")
            return
        }

        do {
            let newData = try JSONSerialization.data(withJSONObject: cards)
            let existingData = defaults.data(forKey: storageKey)
            defaults.set(newData, forKey: storageKey)
            defaults.synchronize()
            print("[WidgetDataPlugin] Wrote \(cards.count) cards to UserDefaults (App Group: \(appGroupId))")

            // Ne recharger la timeline que si les données ont changé
            if #available(iOS 14.0, *) {
                if newData != existingData {
                    print("[WidgetDataPlugin] Data changed, reloading timelines")
                    WidgetCenter.shared.reloadAllTimelines()
                } else {
                    print("[WidgetDataPlugin] Data unchanged, skipping timeline reload")
                }
            }
        } catch {
            call.reject("Failed to serialize cards: \(error.localizedDescription)")
            return
        }

        call.resolve()
    }
}
