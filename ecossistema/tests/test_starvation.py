import sys
import os
import numpy as np

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.agents import Predator

def test_starvation():
    print("Testing Predator Starvation Logic...")
    
    # Create a predator
    pred = Predator(100, 100)
    pred.max_starvation_distance = 100 # Set low for testing
    
    print(f"Initial distance since meal: {pred.distance_since_meal}")
    print(f"Max starvation distance: {pred.max_starvation_distance}")
    
    # Move predator
    # Force velocity to be non-zero
    pred.velocity = np.array([1.0, 0.0])
    pred.update(800, 600)
    
    print(f"Distance after 1 step (speed 1.0): {pred.distance_since_meal}")
    assert pred.distance_since_meal > 0, "Distance should increase after movement"
    assert pred.alive == True, "Predator should be alive"
    
    # Move until starvation
    for _ in range(100):
        pred.velocity = np.array([1.0, 0.0])
        pred.update(800, 600)
        if not pred.alive:
            break
            
    print(f"Distance after loop: {pred.distance_since_meal}")
    assert pred.alive == False, "Predator should be dead after exceeding max distance"
    print("PASS: Predator died from starvation.")
    
    # Test eating resets distance
    pred2 = Predator(200, 200)
    pred2.max_starvation_distance = 100
    pred2.velocity = np.array([1.0, 0.0])
    pred2.update(800, 600)
    print(f"Pred2 distance before eat: {pred2.distance_since_meal}")
    
    pred2.eat()
    print(f"Pred2 distance after eat: {pred2.distance_since_meal}")
    assert pred2.distance_since_meal == 0, "Distance should be reset after eating"
    print("PASS: Eating resets starvation distance.")

if __name__ == "__main__":
    test_starvation()
