import time
from playwright.sync_api import sync_playwright

def test_login():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        
        print("Navigating to http://localhost:8000...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        time.sleep(1)
        
        # Take Screenshot 1: Header in Logged-Out state
        screenshot_path_1 = r"C:\Users\danks\.gemini\antigravity\brain\1f9d64f0-5ca3-4bc4-86cc-c6aac78140d8\step1_header_logged_out.png"
        page.screenshot(path=screenshot_path_1)
        print(f"Screenshot 1 saved to {screenshot_path_1}")
        
        # Verify Login button is visible in header
        login_btn = page.locator("#btn-header-auth-login")
        btn_text = login_btn.inner_text()
        print("Header Login button found")
        
        # Click Login Button
        print("Clicking Login button...")
        login_btn.click()
        time.sleep(1)
        
        # Take Screenshot 2: Login Modal
        screenshot_path_2 = r"C:\Users\danks\.gemini\antigravity\brain\1f9d64f0-5ca3-4bc4-86cc-c6aac78140d8\step2_login_modal.png"
        page.screenshot(path=screenshot_path_2)
        print(f"Screenshot 2 saved to {screenshot_path_2}")
        
        # Fill in Admin credentials admin / admin123
        print("Entering admin / admin123 credentials...")
        page.fill("#adminUsername", "admin")
        page.fill("#adminPassword", "admin123")
        
        # Submit form
        print("Submitting Admin Login form...")
        page.click("#btn-submit-admin-login")
        time.sleep(2)
        
        # Take Screenshot 3: Admin Dashboard
        screenshot_path_3 = r"C:\Users\danks\.gemini\antigravity\brain\1f9d64f0-5ca3-4bc4-86cc-c6aac78140d8\step3_admin_dashboard.png"
        page.screenshot(path=screenshot_path_3)
        print(f"Screenshot 3 saved to {screenshot_path_3}")
        
        # Verify Admin Dashboard title
        admin_title = page.locator(".admin-dashboard-container h2").inner_text()
        print(f"Admin Dashboard Heading: '{admin_title}'")
        
        browser.close()

if __name__ == "__main__":
    test_login()
