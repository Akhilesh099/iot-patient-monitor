import tkinter as tk
import serial
import time
import threading
import random

PORT = "COM10"   # CHANGE if needed
BAUD = 115200

class HospitalMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("Hospital Monitor (Python → ESP8266)")
        self.root.geometry("400x300")

        self.emergency = False
        self.running = True
        self.ser = None   # IMPORTANT

        # ---- Try Serial ----
        try:
            self.ser = serial.Serial(PORT, BAUD, timeout=1)
            time.sleep(2)
            print("SERIAL CONNECTED")
        except Exception as e:
            print("SERIAL ERROR:", e)
            return

        # ---- UI ----
        self.hr_lbl = tk.Label(root, text="HR: --", font=("Arial", 20))
        self.hr_lbl.pack(pady=10)

        self.sp_lbl = tk.Label(root, text="SpO2: --", font=("Arial", 20))
        self.sp_lbl.pack(pady=10)

        self.btn = tk.Button(root, text="EMERGENCY", command=self.toggle,
                             bg="red", fg="white", font=("Arial", 14))
        self.btn.pack(pady=20)

        threading.Thread(target=self.send_loop, daemon=True).start()

    def toggle(self):
        self.emergency = not self.emergency
        self.btn.config(
            text="NORMAL" if self.emergency else "EMERGENCY",
            bg="green" if self.emergency else "red"
        )

    def send_loop(self):
        while self.running and self.ser:
            if self.emergency:
                hr = random.randint(140, 160)
                spo2 = random.randint(75, 85)
            else:
                hr = random.randint(72, 82)
                spo2 = random.randint(96, 99)

            payload = f"HR:{hr},SpO2:{spo2}\n"

            try:
                self.ser.write(payload.encode())
                print("PYTHON →", payload.strip())
            except Exception as e:
                print("SERIAL WRITE ERROR:", e)
                break

            self.hr_lbl.config(text=f"HR: {hr}")
            self.sp_lbl.config(text=f"SpO2: {spo2}")

            time.sleep(1)

    def close(self):
        self.running = False
        if self.ser:
            self.ser.close()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = HospitalMonitor(root)
    root.protocol("WM_DELETE_WINDOW", app.close)
    root.mainloop()
