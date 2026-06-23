import { collection, doc, getDocs, limit, query, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { CANDIDATE_DECK } from "./candidatesData";

/**
 * Automatically seeds default profiles from CANDIDATE_DECK into Firestore
 * if they are missing. This resolves the cold-start problem and guarantees 
 * an active Tinder-like environment instantly upon market launch.
 */
export async function seedCandidateProfilesIfEmpty() {
  try {
    const usersColl = collection(db, "users");
    // Query a small batch to check if records already exist
    const q = query(usersColl, limit(2));
    const querySnapshot = await getDocs(q);

    // If there's already some seeded/stored data, skip to save reads
    if (!querySnapshot.empty && querySnapshot.size >= 2) {
      console.log("Database already seeded with default candidate profiles.");
      return;
    }

    console.log("No default candidate profiles found in Firestore. Seeding starting...");
    const batch = writeBatch(db);

    for (const candidate of CANDIDATE_DECK) {
      const docRef = doc(db, "users", candidate.id);
      
      // Setup as a structured user profile doc in Firestore
      batch.set(docRef, {
        uid: candidate.id,
        name: candidate.name,
        age: candidate.age,
        gender: candidate.gender,
        distance: candidate.distance,
        bio: candidate.bio,
        avatarEmoji: candidate.avatarEmoji,
        avatarBg: candidate.avatarBg,
        humorBadges: candidate.humorBadges,
        humorScores: candidate.humorScores,
        favoriteMemeIds: candidate.favoriteMemeIds,
        compatibleTitle: candidate.compatibleTitle,
        personalityPrompt: candidate.personalityPrompt,
        isCompleted: true,
        isSeeded: true,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    await batch.commit();
    console.log("Database successfully seeded with compatible candidates.");
  } catch (err) {
    console.error("Failed to seed initial candidates to database:", err);
  }
}
