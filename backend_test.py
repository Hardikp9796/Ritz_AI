import requests
import sys
import json
from datetime import datetime

class POSAPITester:
    def __init__(self, base_url="https://pizzastallpos.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, description=""):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result["error"] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, result["response_data"] if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API",
            "GET",
            "",
            200,
            description="Check if API is accessible"
        )

    def test_get_menu(self):
        """Test menu retrieval"""
        success, response = self.run_test(
            "Get Menu",
            "GET",
            "menu",
            200,
            description="Retrieve all menu items"
        )
        
        if success and response:
            print(f"   Found {len(response)} menu items")
            categories = set(item.get('category', 'unknown') for item in response)
            print(f"   Categories: {', '.join(categories)}")
            
        return success, response

    def test_create_order(self):
        """Test order creation with sample data"""
        # First get menu to use real items
        menu_success, menu_data = self.test_get_menu()
        if not menu_success or not menu_data:
            print("❌ Cannot test order creation - menu not available")
            return False, {}

        # Use first few items from menu
        sample_items = []
        for item in menu_data[:2]:  # Take first 2 items
            sample_items.append({
                "item_id": item["id"],
                "item_name": item["name"],
                "quantity": 1,
                "price": item["price"],
                "cogs": item["cogs"]
            })

        order_data = {
            "items": sample_items,
            "total": sum(item["price"] for item in sample_items),
            "gross_profit": sum(item["price"] - item["cogs"] for item in sample_items),
            "order_type": "dine-in",
            "table_token": "T001",
            "payment_type": "cash"
        }

        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data,
            description="Create a new order with sample items"
        )

        if success and response:
            print(f"   Order created with ID: {response.get('id')}")
            print(f"   Order number: {response.get('order_number')}")
            return success, response

        return success, {}

    def test_get_orders(self):
        """Test order history retrieval"""
        return self.run_test(
            "Get Orders",
            "GET",
            "orders?limit=10",
            200,
            description="Retrieve order history"
        )

    def test_get_inventory(self):
        """Test inventory retrieval"""
        return self.run_test(
            "Get Inventory",
            "GET",
            "inventory",
            200,
            description="Retrieve inventory data"
        )

    def test_update_inventory(self):
        """Test inventory update"""
        # First get inventory to find an item to update
        inv_success, inv_data = self.test_get_inventory()
        if not inv_success or not inv_data:
            print("❌ Cannot test inventory update - inventory not available")
            return False, {}

        # Update first item's stock
        first_item = inv_data[0]
        item_id = first_item["id"]
        original_stock = first_item["stock"]
        new_stock = original_stock + 10  # Add 10 to stock

        success, response = self.run_test(
            "Update Inventory",
            "PUT",
            f"inventory/{item_id}",
            200,
            data={"stock": new_stock},
            description=f"Update stock for {first_item['name']}"
        )

        if success:
            print(f"   Updated {first_item['name']} stock from {original_stock} to {new_stock}")

        return success, response

    def test_analytics_sales(self):
        """Test sales analytics"""
        periods = ["today", "week", "month"]
        all_success = True
        
        for period in periods:
            success, response = self.run_test(
                f"Analytics Sales ({period})",
                "GET",
                f"analytics/sales?period={period}",
                200,
                description=f"Get sales analytics for {period}"
            )
            
            if success and response:
                print(f"   {period.title()} - Sales: ₹{response.get('total_sales', 0)}, Orders: {response.get('total_orders', 0)}")
            
            all_success = all_success and success

        return all_success, {}

    def test_analytics_best_sellers(self):
        """Test best sellers analytics"""
        return self.run_test(
            "Analytics Best Sellers",
            "GET",
            "analytics/best-sellers",
            200,
            description="Get best selling items"
        )

    def test_payment_endpoints(self):
        """Test payment endpoints (will fail if Razorpay not configured)"""
        print("\n🔍 Testing Payment Endpoints (may fail if Razorpay not configured)...")
        
        # Test create payment order
        payment_data = {"amount": 100.0}
        success, response = self.run_test(
            "Create Razorpay Order",
            "POST",
            "payment/create-order",
            200,
            data=payment_data,
            description="Create Razorpay payment order"
        )
        
        if not success:
            print("   ⚠️  Payment endpoints not configured (expected if Razorpay keys not set)")
        
        return success, response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting POCKETO POS API Tests")
        print("=" * 50)

        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test menu operations
        self.test_get_menu()
        
        # Test order operations
        self.test_create_order()
        self.test_get_orders()
        
        # Test inventory operations
        self.test_get_inventory()
        self.test_update_inventory()
        
        # Test analytics
        self.test_analytics_sales()
        self.test_analytics_best_sellers()
        
        # Test payment (optional)
        self.test_payment_endpoints()

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                "summary": {
                    "tests_run": self.tests_run,
                    "tests_passed": self.tests_passed,
                    "success_rate": (self.tests_passed/self.tests_run)*100
                },
                "test_results": self.test_results,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
        
        return self.tests_passed == self.tests_run

def main():
    tester = POSAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())