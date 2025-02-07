from sklearn.preprocessing import LabelEncoder

class Enigma:
    def __init__(self, offset=1000000):
        # Enigma สำหรับ encode/decode ข้อมูล
        # :param offset: ค่าขั้นต่ำที่ใช้ทำให้ตัวเลขกลายเป็น 7 หลัก
        self.encoder = LabelEncoder()
        self.mapping = {}
        self.offset = offset

    def fit(self, student_ids):
        # สร้าง mapping ของ student_ids
        self.encoder.fit(student_ids)
        self.mapping = dict(zip(self.encoder.classes_, range(len(self.encoder.classes_))))

    def encode(self, student_ids):
        encoded = int(student_ids) + 1111
        return encoded

    def decode(self, encoded_ids):
        encoded = int(encoded_ids) - 1111
        return encoded