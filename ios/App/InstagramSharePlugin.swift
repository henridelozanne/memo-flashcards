import Capacitor
import UIKit

@objc(InstagramSharePlugin)
public class InstagramSharePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "InstagramSharePlugin"
    public let jsName = "InstagramShare"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "shareToStories", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isInstagramAvailable", returnType: CAPPluginReturnPromise),
    ]

    // Vérifie si Instagram est installé
    @objc func isInstagramAvailable(_ call: CAPPluginCall) {
        guard let url = URL(string: "instagram-stories://share?source_application=cortx") else {
            call.resolve(["available": false])
            return
        }
        let available = UIApplication.shared.canOpenURL(url)
        call.resolve(["available": available])
    }

    // Partage une image base64 directement dans Instagram Stories
    @objc func shareToStories(_ call: CAPPluginCall) {
        guard let base64 = call.getString("imageBase64"),
              let imageData = Data(base64Encoded: base64, options: .ignoreUnknownCharacters),
              let image = UIImage(data: imageData) else {
            call.reject("Invalid image data")
            return
        }

        guard let storiesUrl = URL(string: "instagram-stories://share?source_application=cortx"),
              UIApplication.shared.canOpenURL(storiesUrl) else {
            call.reject("Instagram not available")
            return
        }

        // Écrit l'image dans le pasteboard avec la clé propriétaire Instagram
        let pasteboardItems: [String: Any] = [
            "com.instagram.sharedSticker.backgroundImage": image.pngData() as Any
        ]
        UIPasteboard.general.setItems([pasteboardItems], options: [
            .expirationDate: Date().addingTimeInterval(60 * 5)
        ])

        UIApplication.shared.open(storiesUrl, options: [:]) { success in
            if success {
                call.resolve()
            } else {
                call.reject("Failed to open Instagram")
            }
        }
    }
}
