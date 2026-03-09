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
            let data = try JSONSerialization.data(withJSONObject: cards)
            defaults.set(data, forKey: storageKey)
            defaults.synchronize()
        } catch {
            call.reject("Failed to serialize cards: \(error.localizedDescription)")
            return
        }

        // Demander à WidgetKit de recharger toutes les timelines
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve()
    }
}
