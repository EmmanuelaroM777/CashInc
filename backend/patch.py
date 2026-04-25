import asyncio
import string
import random
from motor.motor_asyncio import AsyncIOMotorClient

def generate_company_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

async def main():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.infracontrol
    users = db.users.find({'role': 'admin', 'company_code': {'$exists': False}})
    
    count = 0
    async for user in users:
        code = generate_company_code()
        await db.users.update_one({'_id': user['_id']}, {'$set': {'company_code': code}})
        print(f"Updated admin {user.get('email')} with code {code}")
        count += 1
        
    print(f"Done. Updated {count} users.")

if __name__ == '__main__':
    asyncio.run(main())
