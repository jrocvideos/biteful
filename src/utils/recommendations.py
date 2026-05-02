#!/usr/bin/env python3
"""
Boufet Recommendation Engine v1.0
Analyzes customer order patterns to predict what they'll crave next.
"""

import json
from collections import Counter, defaultdict
from datetime import datetime
from typing import List, Dict, Any, Tuple

class BoufetRecommender:
    def __init__(self):
        self.cuisine_affinity = defaultdict(float)
        self.price_tolerance = {"min": 0, "max": 100, "avg": 25}
        self.temporal_patterns = defaultdict(Counter)

    def build_user_profile(self, customer_id: str, orders: List[Dict]) -> Dict[str, Any]:
        if not orders:
            return self._default_profile()

        profile = {
            "customer_id": customer_id,
            "total_orders": len(orders),
            "total_spent": sum(o["total"] for o in orders),
            "favorite_cuisines": self._extract_cuisines(orders),
            "favorite_items": self._extract_favorite_items(orders),
            "price_comfort_zone": self._analyze_spending(orders),
            "temporal_patterns": self._analyze_timing(orders),
            "reorder_candidates": self._find_reorder_candidates(orders),
            "exploration_score": self._calculate_exploration(orders),
            "dietary_signals": self._detect_dietary_preferences(orders),
        }
        return profile

    def _extract_cuisines(self, orders: List[Dict]) -> List[Tuple[str, float]]:
        cuisine_counts = Counter()
        for order in orders:
            restaurant = order.get("restaurantName", "").lower()
            items = order.get("items", [])
            if any(w in restaurant for w in ["sushi", "ramen", "japan"]):
                cuisine_counts["japanese"] += len(items)
            elif any(w in restaurant for w in ["burger", "bbq", "american"]):
                cuisine_counts["american"] += len(items)
            elif any(w in restaurant for w in ["taco", "burrito", "mexican"]):
                cuisine_counts["mexican"] += len(items)
            elif any(w in restaurant for w in ["pizza", "pasta", "italian"]):
                cuisine_counts["italian"] += len(items)
            elif any(w in restaurant for w in ["thai", "pad"]):
                cuisine_counts["thai"] += len(items)
            elif any(w in restaurant for w in ["indian", "curry", "tandoori"]):
                cuisine_counts["indian"] += len(items)
            else:
                cuisine_counts["mixed"] += len(items)

        total = sum(cuisine_counts.values())
        if total == 0:
            return [("mixed", 1.0)]
        return sorted([(c, count/total) for c, count in cuisine_counts.items()], key=lambda x: x[1], reverse=True)

    def _extract_favorite_items(self, orders: List[Dict]) -> List[Tuple[str, float]]:
        item_counts = Counter()
        for order in orders:
            for item in order.get("items", []):
                item_counts[item["name"]] += item.get("quantity", 1)
        total = sum(item_counts.values())
        if total == 0:
            return []
        return sorted([(name, count/total) for name, count in item_counts.items()], key=lambda x: x[1], reverse=True)[:5]

    def _analyze_spending(self, orders: List[Dict]) -> Dict:
        totals = [o["total"] for o in orders]
        if not totals:
            return {"low": 15, "mid": 25, "high": 40}
        avg = sum(totals) / len(totals)
        return {"low": round(avg * 0.6, 2), "mid": round(avg, 2), "high": round(avg * 1.4, 2)}

    def _analyze_timing(self, orders: List[Dict]) -> Dict:
        hours = Counter()
        days = Counter()
        for order in orders:
            try:
                dt = datetime.fromisoformat(order.get("date", "").replace("Z", "+00:00"))
                hours[dt.hour] += 1
                days[dt.strftime("%A")] += 1
            except:
                pass
        return {
            "peak_hours": [h for h, _ in hours.most_common(3)],
            "peak_days": [d for d, _ in days.most_common(3)],
        }

    def _find_reorder_candidates(self, orders: List[Dict]) -> List[Dict]:
        item_history = defaultdict(list)
        for order in orders:
            try:
                dt = datetime.fromisoformat(order.get("date", "").replace("Z", "+00:00"))
            except:
                dt = datetime.now()
            for item in order.get("items", []):
                item_history[item["name"]].append({"date": dt, "price": item["price"], "restaurant": order.get("restaurantName", "")})

        candidates = []
        now = datetime.now()
        for item_name, history in item_history.items():
            if len(history) >= 2:
                last_order = max(h["date"] for h in history)
                days_since = (now - last_order).days
                freq_score = min(len(history) / 5, 1.0)
                recency_score = max(0, 1 - (days_since / 30))
                score = (freq_score * 0.6) + (recency_score * 0.4)
                if score > 0.3:
                    candidates.append({
                        "item_name": item_name,
                        "score": round(score, 2),
                        "times_ordered": len(history),
                        "days_since_last": days_since,
                        "restaurant": history[-1]["restaurant"],
                        "price": history[-1]["price"],
                        "reason": "You order this often — craving it again?"
                    })
        return sorted(candidates, key=lambda x: x["score"], reverse=True)[:5]

    def _calculate_exploration(self, orders: List[Dict]) -> float:
        if len(orders) < 3:
            return 0.5
        unique_items = set()
        total_items = 0
        for order in orders:
            for item in order.get("items", []):
                unique_items.add(item["name"])
                total_items += 1
        return round(len(unique_items) / total_items, 2) if total_items > 0 else 0.5

    def _detect_dietary_preferences(self, orders: List[Dict]) -> List[str]:
        signals = []
        all_names = " ".join(item["name"].lower() for order in orders for item in order.get("items", []))
        if any(w in all_names for w in ["vegan", "plant", "tofu", "beyond"]):
            signals.append("plant-forward")
        if any(w in all_names for w in ["spicy", "hot", "chili", "sriracha"]):
            signals.append("spice-lover")
        if any(w in all_names for w in ["wings", "burger", "fries", "poutine"]):
            signals.append("comfort-food")
        if any(w in all_names for w in ["keto", "low-carb", "salad", "bowl"]):
            signals.append("health-conscious")
        return signals

    def _default_profile(self) -> Dict:
        return {
            "customer_id": "new",
            "total_orders": 0,
            "total_spent": 0,
            "favorite_cuisines": [("mixed", 1.0)],
            "favorite_items": [],
            "price_comfort_zone": {"low": 15, "mid": 25, "high": 40},
            "temporal_patterns": {"peak_hours": [12, 18], "peak_days": ["Friday", "Saturday"]},
            "reorder_candidates": [],
            "exploration_score": 0.5,
            "dietary_signals": []
        }

    def generate_recommendations(self, customer_id: str, orders: List[Dict], available_menu: List[Dict]) -> Dict[str, Any]:
        profile = self.build_user_profile(customer_id, orders)
        return {
            "profile": profile,
            "reorder_now": self._reorder_recommendations(profile),
            "generated_at": datetime.now().isoformat()
        }

    def _reorder_recommendations(self, profile: Dict) -> List[Dict]:
        candidates = profile.get("reorder_candidates", [])
        return [{
            "type": "reorder",
            "item_name": c["item_name"],
            "restaurant": c["restaurant"],
            "price": c["price"],
            "confidence": c["score"],
            "reason": c["reason"],
            "badge": "Order Again"
        } for c in candidates[:3]]

def main():
    sample_orders = [
        {
            "id": "ORD-001",
            "restaurantId": "sushi-palace",
            "restaurantName": "Sushi Palace",
            "items": [{"id": "1", "name": "Salmon Roll", "price": 8.99, "quantity": 2}, {"id": "2", "name": "Spicy Tuna", "price": 10.99, "quantity": 1}],
            "total": 28.97,
            "date": "2026-04-25T19:30:00",
            "status": "delivered"
        },
        {
            "id": "ORD-002",
            "restaurantId": "sushi-palace",
            "restaurantName": "Sushi Palace",
            "items": [{"id": "1", "name": "Salmon Roll", "price": 8.99, "quantity": 3}, {"id": "3", "name": "Miso Soup", "price": 3.99, "quantity": 1}],
            "total": 30.96,
            "date": "2026-04-28T18:15:00",
            "status": "delivered"
        },
        {
            "id": "ORD-003",
            "restaurantId": "burger-joint",
            "restaurantName": "Burger Joint",
            "items": [{"id": "4", "name": "Classic Burger", "price": 12.99, "quantity": 2}, {"id": "5", "name": "Truffle Fries", "price": 6.99, "quantity": 1}],
            "total": 32.97,
            "date": "2026-04-30T12:30:00",
            "status": "delivered"
        }
    ]

    engine = BoufetRecommender()
    recs = engine.generate_recommendations("customer-123", sample_orders, [])
    
    print("=" * 60)
    print("BITEFUL RECOMMENDATION ENGINE RESULTS")
    print("=" * 60)
    print(json.dumps(recs, indent=2))
    print("=" * 60)
    
    with open("recommendations.json", "w") as f:
        json.dump(recs, f, indent=2)
    
    print("\n✅ Saved to recommendations.json")
    print(f"\nKey Insights:")
    print(f"  • Favorite cuisine: {recs['profile']['favorite_cuisines'][0][0]} ({recs['profile']['favorite_cuisines'][0][1]:.0%} affinity)")
    print(f"  • Exploration score: {recs['profile']['exploration_score']} (0=habitual, 1=adventurous)")
    print(f"  • Avg order value: ${recs['profile']['price_comfort_zone']['mid']}")

if __name__ == "__main__":
    main()
