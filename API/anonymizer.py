import random

class Anonymizer:
    def __init__(self):
        # กำหนดรายการชื่อและนามสกุลภายใน constructor
        self.first_names = ['MAXIMILLIAN', 'ALEXANDRIA', 'LEONARDO', 'VALENTINA', 'THEODORA', 'ELEANORA', 'ZEPHYRUS', 'CASSIOPEIA', 'AURELIUS', 'LUCINDRA']
        self.last_names = ['PUTIN', 'KIM', 'MUSK', 'OBAMA', 'MERKEL', 'TRUMP', 'THATCHER', 'CHURCHILL', 'ROBERTS', 'MANDELA']
        self.genders = ['Male','Female']
        self.name_mapping = {}

    def anonymize(self, fname, lname):
        """
        สุ่มชื่อและนามสกุลใหม่ที่ดูสมจริง
        """
        if (fname, lname) not in self.name_mapping:
            # สุ่มชื่อและนามสกุลใหม่
            anon_fname = random.choice(self.first_names)
            anon_lname = random.choice(self.last_names)
            anon_gender = random.choice(self.genders)
            anon_email = f"{anon_fname.lower()}.{anon_lname.lower()}@student.mahidol.ac.th"
            
            self.name_mapping[(fname, lname)] = (anon_fname, anon_lname, anon_gender, anon_email)
        return self.name_mapping[(fname, lname)]
