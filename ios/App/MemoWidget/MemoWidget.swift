//
//  MemoWidget.swift
//  MemoWidget
//
//  Created by Henri Delozanne on 09/03/2026.
//

import WidgetKit
import SwiftUI

// MARK: - Data model

struct FlashCard: Codable {
    let question: String
    let answer: String
}

func loadCards() -> [FlashCard] {
    guard
        let defaults = UserDefaults(suiteName: "group.com.memoflashcards.app"),
        let data = defaults.data(forKey: "widgetCards"),
        let cards = try? JSONDecoder().decode([FlashCard].self, from: data)
    else {
        return []
    }
    return cards
}

// MARK: - Timeline

struct CardEntry: TimelineEntry {
    let date: Date
    let card: FlashCard?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> CardEntry {
        CardEntry(date: Date(), card: FlashCard(question: "Qu'est-ce que la mémoire ?", answer: "La capacité à retenir des informations"))
    }

    func getSnapshot(in context: Context, completion: @escaping (CardEntry) -> ()) {
        let cards = loadCards()
        let card = cards.first ?? FlashCard(question: "Qu'est-ce que la mémoire ?", answer: "La capacité à retenir des informations")
        completion(CardEntry(date: Date(), card: card))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CardEntry>) -> ()) {
        let cards = loadCards()
        guard !cards.isEmpty else {
            let entry = CardEntry(date: Date(), card: nil)
            completion(Timeline(entries: [entry], policy: .atEnd))
            return
        }

        // Une carte différente toutes les minutes (test)
        let now = Date()
        var entries: [CardEntry] = []
        for (index, card) in cards.prefix(48).enumerated() {
            let entryDate = Calendar.current.date(byAdding: .minute, value: index * 1, to: now)!
            entries.append(CardEntry(date: entryDate, card: card))
        }

        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// MARK: - Views

let widgetPurple = Color(red: 95/255, green: 51/255, blue: 225/255)
let widgetPurpleDark = Color(red: 60/255, green: 20/255, blue: 160/255)

struct MemoWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        if let card = entry.card {
            ZStack(alignment: .topTrailing) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer()

                    // Question
                    Text(card.question)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(3)
                        .minimumScaleFactor(0.75)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)

                    // Séparateur
                    Rectangle()
                        .fill(Color.white.opacity(0.25))
                        .frame(height: 1)
                        .padding(.vertical, 8)

                    // Réponse
                    Text(card.answer)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(3)
                        .minimumScaleFactor(0.75)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)

                    Spacer()
                }
                .padding(12)
                .frame(maxWidth: .infinity, maxHeight: .infinity)

                Image("AppLogo")
                    .resizable()
                    .frame(width: 18, height: 18)
                    .cornerRadius(4)
                    .padding(.top, 6)
                    .padding(.trailing, 6)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            VStack(spacing: 6) {
                Image("AppLogo")
                    .resizable()
                    .frame(width: 32, height: 32)
                    .cornerRadius(8)
                Text("Ouvre l'app pour\ncommencer à réviser")
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.white.opacity(0.8))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

// MARK: - Widget

struct MemoWidget: Widget {
    let kind: String = "MemoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                MemoWidgetEntryView(entry: entry)
                    .containerBackground(for: .widget) {
                        LinearGradient(
                            colors: [
                                Color(red: 95/255, green: 51/255, blue: 225/255),
                                Color(red: 60/255, green: 20/255, blue: 160/255)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    }
            } else {
                ZStack {
                    LinearGradient(
                        colors: [
                            Color(red: 95/255, green: 51/255, blue: 225/255),
                            Color(red: 60/255, green: 20/255, blue: 160/255)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    MemoWidgetEntryView(entry: entry)
                }
            }
        }
        .configurationDisplayName("Mémo Flashcards")
        .description("Révisez vos cartes directement depuis l'écran d'accueil.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
    MemoWidget()
} timeline: {
    CardEntry(date: Date(), card: FlashCard(question: "Qu'est-ce que la photosynthèse ?", answer: "Le processus par lequel les plantes produisent leur nourriture"))
    CardEntry(date: Date(), card: FlashCard(question: "Quelle est la capitale du Japon ?", answer: "Tokyo"))
}
