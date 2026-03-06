"""
Seed complete demo data for Meta App Review.

Creates: tenant, admin, managers, Instagram account, bot config,
catalog (cosmetology courses), dialogs, messages, and leads.

Usage:
    python manage.py seed_demo
    python manage.py seed_demo --reset  # wipe and recreate
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import InstagramAccount
from apps.bot.models import BotConfig
from apps.catalog.models import Category, Item
from apps.dialogs.models import Dialog, Message
from apps.leads.models import Lead
from apps.tenants.models import Tenant, User

TENANT_SLUG = "demo"
TENANT_NAME = "Beauty Academy"
TENANT_INDUSTRY = "Beauty & Cosmetology"

ADMIN = {
    "username": "admin",
    "email": "admin@beautacademy.com",
    "password": "demo2026!",
}

MANAGERS = [
    {
        "username": "olena.m",
        "email": "olena@beautacademy.com",
        "password": "manager2026!",
        "first_name": "Olena",
        "last_name": "Marchenko",
    },
    {
        "username": "igor.k",
        "email": "igor@beautacademy.com",
        "password": "manager2026!",
        "first_name": "Igor",
        "last_name": "Kravchenko",
    },
]

INSTAGRAM_ACCOUNT = {
    "instagram_user_id": "17841400000000001",
    "username": "beauty_academy_demo",
    "access_token": "PLACEHOLDER_TOKEN_REPLACE_VIA_SETTINGS",
    "page_id": "100000000000001",
}

BOT_CONFIG = {
    "bot_name": "Beauty Academy Assistant",
    "tone": "friendly",
    "goal": (
        "Qualify leads interested in cosmetology courses. "
        "Collect name and phone number. Recommend suitable courses. "
        "Hand off to manager for complex questions."
    ),
    "greeting_template": (
        "Hi! Thanks for your comment! I'd be happy to tell you more about "
        "our courses. What area of cosmetology interests you most?"
    ),
    "escalation_trigger": (
        "Customer asks for manager, wants a discount, has a complaint, "
        "or asks about custom/corporate training."
    ),
    "forbidden_topics": (
        "Do not discuss competitors. Do not promise discounts "
        "without manager approval. Do not give medical advice."
    ),
}

CATALOG = [
    {
        "name": "Basic Courses",
        "description": "Courses for beginner cosmetologists",
        "items": [
            {
                "name": 'Course "Cosmetologist from Scratch"',
                "short_description": (
                    "Full 3-month basic course for beginners. "
                    "Covers skincare, equipment, theory of injections. "
                    "45,000 UAH, installment available."
                ),
                "context": """Full basic course for beginner cosmetologists.

Duration: 3 months (120 academic hours)
Format: in-person, groups up to 8 people
Price: 45,000 UAH
Installment: yes, up to 4 payments of 11,250 UAH

Program:
- Skin anatomy and physiology
- Skin types, condition diagnostics
- Basic skincare procedures (cleansing, peels, masks)
- Equipment cosmetology (darsonval, ultrasound, microcurrents)
- Basics of injection cosmetology (theory)
- Sanitary standards and sterilization

Certificate: state-standard certificate upon completion
Employment: we assist with placement at partner clinics

FAQ:
- "Do I need medical education?" -- No, we accept anyone 18+ with any education
- "Is there hands-on practice?" -- Yes, 60% of the course is practice on models
- "Can I combine with work?" -- Yes, we have weekend groups""",
                "bot_instructions": (
                    "This is our flagship product. Emphasize the certificate "
                    "and employment assistance. Always mention the installment option."
                ),
            },
            {
                "name": 'Course "Facial Cleansing"',
                "short_description": (
                    "2-day specialized course on all types of facial cleansing. "
                    "8,500 UAH. Suitable for beginners."
                ),
                "context": """Specialized course on all types of facial cleansing.

Duration: 2 days (16 academic hours)
Format: in-person, mini-groups up to 5 people
Price: 8,500 UAH

Program:
- Manual cleansing
- Ultrasonic cleansing
- Combined cleansing
- Atraumatic Holy Land cleansing
- Working with different skin types
- Post-procedure care and client recommendations

Certificate upon completion.
Practice models provided.

FAQ:
- "Suitable for beginners?" -- Yes, we start from basics
- "What to bring?" -- Everything is provided""",
            },
        ],
    },
    {
        "name": "Injection Cosmetology",
        "description": "Courses on injections: botox, fillers, mesotherapy, biorevitalization",
        "items": [
            {
                "name": 'Course "Botulinum Therapy"',
                "short_description": (
                    "2-day course on Botox/Dysport/Xeomin. "
                    "12,000 UAH. Requires medical education."
                ),
                "context": """Course on botulinum toxin (Botox, Dysport, Xeomin).

Duration: 2 days (16 academic hours)
Format: in-person, groups up to 6 people
Price: 12,000 UAH
Installment: yes, 2 payments of 6,000 UAH

Requirements: medical education (doctor or nurse)

Program:
- Anatomy of mimic muscles
- Indications and contraindications
- Upper face injection techniques
- Middle and lower face injection techniques
- Complication management
- Practice on models (2-3 models per student)

Preparation materials included in price.

FAQ:
- "Without medical education?" -- No, medical education required
- "Which preparations?" -- Botox (Allergan), Dysport (Ipsen)
- "How much can I earn?" -- From 3,000 UAH/day average market rate""",
            },
            {
                "name": 'Course "Filler Contouring"',
                "short_description": (
                    "2-day course on hyaluronic acid fillers. "
                    "14,000 UAH. Lips, nasolabial folds, cheekbones."
                ),
                "context": """Course on hyaluronic acid-based filler work.

Duration: 2 days (16 academic hours)
Format: in-person, groups up to 6 people
Price: 14,000 UAH
Installment: yes, 2 payments of 7,000 UAH

Requirements: medical education

Program:
- Facial anatomy for injections (vessels, nerves, danger zones)
- Lips: augmentation, contouring, asymmetry correction
- Nasolabial folds
- Cheekbones and chin
- Techniques: linear, fan, bolus
- Prevention and treatment of complications
- Practice on models

Preparations included: Juvederm, Stylage

FAQ:
- "Most popular client request?" -- Lips, then nasolabial folds
- "Continuing education?" -- Yes, monthly masterclasses""",
            },
            {
                "name": 'Course "Mesotherapy & Biorevitalization"',
                "short_description": (
                    "2-day course on mesotherapy for face, body, and scalp. "
                    "10,000 UAH."
                ),
                "context": """Course on mesotherapy of face, body, and scalp + biorevitalization.

Duration: 2 days (16 academic hours)
Format: in-person, groups up to 6 people
Price: 10,000 UAH
Installment: yes, 2 payments of 5,000 UAH

Requirements: medical education

Program:
- Mesotherapy theory: preparations, cocktails, protocols
- Facial mesotherapy (anti-age, hydration, glow)
- Body mesotherapy (lipolytics, anti-cellulite protocols)
- Hair mesotherapy (trichology)
- Biorevitalization: preparations and techniques
- Practice on models

FAQ:
- "Difference between meso and biorevitalization?" -- Meso uses cocktails, biorevit uses pure hyaluronic acid
- "Which preparations?" -- Dermaheal, Fusion, Jalupro, Juvederm Volite""",
            },
        ],
    },
    {
        "name": "Equipment Cosmetology",
        "description": "Courses on cosmetology equipment operation",
        "items": [
            {
                "name": 'Course "Laser Cosmetology"',
                "short_description": (
                    "3-day comprehensive laser course. "
                    "18,000 UAH. Epilation, pigmentation, rejuvenation."
                ),
                "context": """Comprehensive course on laser equipment operation.

Duration: 3 days (24 academic hours)
Format: in-person, groups up to 5 people
Price: 18,000 UAH
Installment: yes, 3 payments of 6,000 UAH

Program:
- Physics of laser radiation
- Laser types (diode, alexandrite, neodymium, CO2)
- Laser epilation: protocols for different phototypes
- Laser pigmentation removal
- Laser vascular removal
- Fractional rejuvenation
- Complication management
- Practice on equipment (working on models)

Equipment: Candela, Lumenis from our training center

FAQ:
- "Need my own equipment?" -- No, practice on ours
- "Best laser to buy for starting?" -- Individual consultation after course
- "Available without medical education?" -- Laser epilation yes, rest needs medical education""",
            },
            {
                "name": 'Course "RF-Lifting & Microcurrents"',
                "short_description": (
                    "1-day course on skin lifting and toning. "
                    "6,000 UAH. No medical education required."
                ),
                "context": """Course on equipment methods for skin lifting and toning.

Duration: 1 day (8 academic hours)
Format: in-person, groups up to 6 people
Price: 6,000 UAH

Program:
- RF-lifting theory: monopolar, bipolar, multipolar
- RF protocols for face and body
- Microcurrent therapy: principles and protocols
- Combining methods
- Practice on models

FAQ:
- "Available without medical education?" -- Yes, equipment cosmetology is available without medical education
- "From what age for clients?" -- Usually 30+, but protocols exist from 25""",
            },
        ],
    },
    {
        "name": "Advanced Training",
        "description": "Masterclasses and advanced techniques for practicing specialists",
        "items": [
            {
                "name": 'Masterclass "Thread Lifting"',
                "short_description": (
                    "1-day advanced masterclass on thread lifting. "
                    "20,000 UAH. Requires 1+ year injection experience."
                ),
                "context": """Advanced masterclass on facial thread lifting.

Duration: 1 day (8 academic hours)
Format: in-person, up to 4 people
Price: 20,000 UAH

Requirements: medical education + 1+ year injection experience

Program:
- Thread types (mesothreads, COG, Aptos)
- Anatomy for thread lifting
- Installation techniques
- Working with facial oval and jowls
- Complications and solutions
- Practice: 2 models per participant

Threads included in price.

FAQ:
- "Most popular request?" -- Oval lifting and jowl elimination
- "How often to update skills?" -- Recommend masterclasses every 6 months""",
            },
        ],
    },
]

CONVERSATIONS = [
    {
        "username": "maria_wellness",
        "user_id": "90001",
        "status": "lead",
        "temperature": "hot",
        "name": "Maria Santos",
        "phone": "+380 67 123 4567",
        "interest_item": 'Course "Cosmetologist from Scratch"',
        "messages": [
            ("user", "Hi! I saw your post about cosmetology courses. How much is it?"),
            ("bot", "Hey Maria! Thanks for reaching out! We offer several courses. Are you looking for a full program or a specific skill course?"),
            ("user", "I want the full program, starting from scratch"),
            ("bot", 'Great choice! Our "Cosmetologist from Scratch" course is a 3-month program covering skincare, equipment, and injection theory. It\'s 45,000 UAH with installment options (4 payments of 11,250 UAH). Would you like to know more details?'),
            ("user", "Sounds good. What certificate do I get?"),
            ("bot", "You'll receive a state-standard certificate upon completion. We also help with employment at our partner clinics. Would you like to schedule a free consultation to discuss your goals?"),
            ("user", "Yes! My name is Maria Santos"),
            ("bot", "Nice to meet you, Maria! To schedule your consultation, could you share your phone number? Our coordinator will reach out within 24 hours."),
            ("user", "+380 67 123 4567"),
            ("bot", "Perfect, Maria! I've noted your number. Our coordinator Olena will call you tomorrow. Looking forward to welcoming you to our academy!"),
        ],
    },
    {
        "username": "alex_fit_coach",
        "user_id": "90002",
        "status": "qualified",
        "temperature": "warm",
        "name": "Alex",
        "phone": "",
        "interest_item": 'Course "Facial Cleansing"',
        "messages": [
            ("user", "Do you have short courses for beginners?"),
            ("bot", 'Hi there! Yes, we do! Our "Facial Cleansing" course is perfect for beginners -- it\'s just 2 days and covers all types of cleansing. Only 8,500 UAH. Would you like to learn more?'),
            ("user", "How many people in a group?"),
            ("bot", "We keep groups small -- max 5 people, so you get plenty of hands-on attention. Everything is provided, including practice models. Would you like to sign up for the next session?"),
            ("user", "Maybe, let me think about it. When is the next one?"),
            ("bot", "Of course, take your time! The next session starts March 22nd. By the way, what's your name? I'd love to reserve a spot for you."),
            ("user", "I'm Alex. I'll get back to you this week"),
            ("bot", "Sounds great, Alex! No pressure at all. Feel free to message anytime when you're ready. Spots fill up fast though!"),
        ],
    },
    {
        "username": "sofia.beauty",
        "user_id": "90003",
        "status": "lead",
        "temperature": "hot",
        "name": "Sofia Kovalenko",
        "phone": "+380 50 987 6543",
        "interest_item": 'Course "Botulinum Therapy"',
        "messages": [
            ("user", "Hello! I'm a nurse and want to learn botox injections"),
            ("bot", 'Hi! Great to hear from a medical professional! Our "Botulinum Therapy" course is exactly what you need. It\'s a 2-day intensive covering Botox, Dysport, and Xeomin. 12,000 UAH with installment option.'),
            ("user", "Perfect, I have medical education. When is the next course?"),
            ("bot", "The next session is March 20th. You'll practice on 2-3 models per student, and all preparations are included. Would you like to reserve a spot?"),
            ("user", "Yes please! Sofia Kovalenko, +380 50 987 6543"),
            ("bot", "Wonderful, Sofia! You're registered. You'll receive a confirmation via SMS shortly. Please bring your medical diploma on the first day. See you on March 20th!"),
        ],
    },
    {
        "username": "techie_dev",
        "user_id": "90004",
        "status": "active",
        "temperature": "cold",
        "name": "Oleg",
        "phone": "",
        "interest_item": "",
        "messages": [
            ("user", "what courses do you offer?"),
            ("bot", "Hey! Thanks for your interest! We offer a range of cosmetology courses: basic courses for beginners, injection techniques (botox, fillers), laser cosmetology, and advanced masterclasses. What area interests you most?"),
            ("user", "just browsing for now"),
            ("bot", "No problem at all! Feel free to look around. We have courses for all levels, from complete beginners to experienced practitioners. Message us anytime you have questions!"),
        ],
    },
    {
        "username": "lena_kyiv",
        "user_id": "90008",
        "status": "active",
        "temperature": "cold",
        "name": "Lena",
        "phone": "+380 73 222 4411",
        "interest_item": "",
        "messages": [
            ("user", "Hey, how long are your courses?"),
            ("bot", "Hi! It depends on the program: from 1-day masterclasses to full 3-month courses. What area of cosmetology are you interested in?"),
            ("user", "Not sure yet, just exploring options. I'm Lena"),
            ("bot", "Nice to meet you, Lena! Take your time. If you'd like, I can send you our full course catalog. Just let me know!"),
        ],
    },
    {
        "username": "anna_photo",
        "user_id": "90005",
        "status": "lead",
        "temperature": "warm",
        "name": "Anna",
        "phone": "+380 63 555 1234",
        "interest_item": 'Course "Laser Cosmetology"',
        "messages": [
            ("user", "Hi! Is the laser cosmetology course still available?"),
            ("bot", 'Hi! Yes, our "Laser Cosmetology" course is available! It\'s a 3-day intensive covering all laser types -- epilation, pigmentation removal, and rejuvenation. 18,000 UAH with installment option.'),
            ("user", "Definitely interested! I'm Anna, can I pay in installments?"),
            ("bot", "Hi Anna! Absolutely! We offer 3 payments of 6,000 UAH each. Could you share your phone number so we can send you the enrollment details?"),
            ("user", "+380 63 555 1234"),
            ("bot", "Thanks Anna! Our coordinator will contact you with payment details. Only 2 spots left in the next group!"),
        ],
    },
    {
        "username": "fitness_lover_99",
        "user_id": "90006",
        "status": "handed_off",
        "temperature": "hot",
        "name": "Dmitry Petrov",
        "phone": "+380 95 777 8899",
        "interest_item": 'Masterclass "Thread Lifting"',
        "messages": [
            ("user", "I'm a practicing cosmetologist with 3 years experience. Interested in thread lifting masterclass"),
            ("bot", 'Great to hear from an experienced practitioner! Our "Thread Lifting" masterclass is perfect for you. It\'s a 1-day intensive for 20,000 UAH, covering all thread types and techniques. You\'ll practice on 2 models.'),
            ("user", "Sounds perfect. Dmitry Petrov, +380 95 777 8899. I have questions about specific techniques though"),
            ("bot", "Thank you, Dmitry! Given your specific technical questions, I'm connecting you with our senior instructor who can discuss the techniques in detail."),
            ("manager", "Hi Dmitry! This is Olena, our lead instructor. I'd love to discuss the specific techniques you're interested in. Are you more focused on COG threads or Aptos? We can customize the practice portion to your needs."),
        ],
    },
    {
        "username": "healthy_eater",
        "user_id": "90007",
        "status": "active",
        "temperature": "warm",
        "name": "Katya",
        "phone": "",
        "interest_item": 'Course "Mesotherapy & Biorevitalization"',
        "messages": [
            ("user", "Do you have mesotherapy courses?"),
            ("bot", 'Hi! Yes, we do! Our "Mesotherapy & Biorevitalization" course covers face, body, and scalp treatments. It\'s a 2-day course for 10,000 UAH with installment option. Do you have medical education?'),
            ("user", "Yes, I'm a nurse. I'm Katya btw. What preparations do you use?"),
            ("bot", "Nice to meet you, Katya! We use top brands: Dermaheal, Fusion, Jalupro, and Juvederm Volite. You'll learn both mesotherapy cocktails and pure biorevitalization techniques. Would you like to enroll?"),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed complete demo data for Meta App Review"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo tenant and all related data before seeding",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = Tenant.objects.filter(slug=TENANT_SLUG).delete()
            if deleted:
                self.stdout.write(self.style.WARNING("Deleted existing demo data"))

        tenant = self._create_tenant()
        admin = self._create_admin(tenant)
        managers = self._create_managers(tenant)
        ig_account = self._create_instagram_account(tenant)
        self._create_bot_config(tenant)
        items_by_name = self._create_catalog(tenant)
        self._create_conversations(tenant, ig_account, items_by_name)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("Demo data ready!"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(f"  Admin login:   {ADMIN['email']} / {ADMIN['password']}")
        self.stdout.write(f"  Manager login: {MANAGERS[0]['email']} / {MANAGERS[0]['password']}")
        self.stdout.write(f"  Manager login: {MANAGERS[1]['email']} / {MANAGERS[1]['password']}")
        self.stdout.write("")
        self.stdout.write(
            "  NOTE: Connect a real Instagram account via "
            "Settings > Instagram to activate webhooks."
        )

    def _create_tenant(self):
        tenant, created = Tenant.objects.get_or_create(
            slug=TENANT_SLUG,
            defaults={"name": TENANT_NAME, "industry": TENANT_INDUSTRY},
        )
        self._log("Tenant", tenant.name, created)
        return tenant

    def _create_admin(self, tenant):
        user, created = User.objects.get_or_create(
            username=ADMIN["username"],
            defaults={
                "email": ADMIN["email"],
                "tenant": tenant,
                "role": User.Role.OWNER,
                "first_name": "Admin",
            },
        )
        if created:
            user.set_password(ADMIN["password"])
            user.save()
        self._log("Admin", f"{ADMIN['email']}", created)
        return user

    def _create_managers(self, tenant):
        managers = []
        for m in MANAGERS:
            user, created = User.objects.get_or_create(
                username=m["username"],
                defaults={
                    "email": m["email"],
                    "tenant": tenant,
                    "role": User.Role.MANAGER,
                    "first_name": m["first_name"],
                    "last_name": m["last_name"],
                },
            )
            if created:
                user.set_password(m["password"])
                user.save()
            self._log("Manager", f"{m['email']}", created)
            managers.append(user)
        return managers

    def _create_instagram_account(self, tenant):
        ig, created = InstagramAccount.objects.get_or_create(
            instagram_user_id=INSTAGRAM_ACCOUNT["instagram_user_id"],
            defaults={
                "tenant": tenant,
                "username": INSTAGRAM_ACCOUNT["username"],
                "access_token": INSTAGRAM_ACCOUNT["access_token"],
                "page_id": INSTAGRAM_ACCOUNT["page_id"],
            },
        )
        self._log("Instagram account", f"@{ig.username}", created)
        return ig

    def _create_bot_config(self, tenant):
        bot, created = BotConfig.objects.get_or_create(
            tenant=tenant, defaults=BOT_CONFIG
        )
        self._log("Bot config", bot.bot_name, created)
        return bot

    def _create_catalog(self, tenant):
        items_by_name = {}
        for order, cat_data in enumerate(CATALOG):
            category, cat_created = Category.objects.get_or_create(
                tenant=tenant,
                name=cat_data["name"],
                defaults={"description": cat_data["description"], "order": order},
            )
            self._log("Category", category.name, cat_created)

            for item_data in cat_data["items"]:
                item, item_created = Item.objects.get_or_create(
                    tenant=tenant,
                    name=item_data["name"],
                    defaults={
                        "category": category,
                        "short_description": item_data.get("short_description", ""),
                        "context": item_data["context"],
                        "bot_instructions": item_data.get("bot_instructions", ""),
                    },
                )
                self._log("  Item", item.name, item_created)
                items_by_name[item.name] = item

        return items_by_name

    def _create_conversations(self, tenant, ig_account, items_by_name):
        now = timezone.now()

        for conv in CONVERSATIONS:
            dialog_time = now - timedelta(hours=random.randint(2, 72))
            dialog, d_created = Dialog.objects.get_or_create(
                tenant=tenant,
                instagram_account=ig_account,
                instagram_user_id=conv["user_id"],
                defaults={
                    "instagram_username": conv["username"],
                    "status": conv["status"],
                    "source": "dm",
                    "is_bot_active": conv["status"] != "handed_off",
                },
            )

            if not d_created and dialog.messages.exists():
                self._log("Dialog", conv["username"], False)
                continue

            dialog.status = conv["status"]
            dialog.instagram_username = conv["username"]
            dialog.is_bot_active = conv["status"] != "handed_off"
            dialog.save()

            msg_time = dialog_time
            for role, text in conv["messages"]:
                Message.objects.create(
                    dialog=dialog, role=role, text=text, created_at=msg_time
                )
                msg_time += timedelta(minutes=random.randint(1, 15))

            if conv["name"]:
                product = items_by_name.get(conv["interest_item"])
                Lead.objects.get_or_create(
                    dialog=dialog,
                    defaults={
                        "tenant": tenant,
                        "name": conv["name"],
                        "phone": conv["phone"],
                        "interest": conv["interest_item"],
                        "product": product,
                        "temperature": conv["temperature"],
                        "manager_notified": conv["temperature"] == "hot",
                    },
                )

            self._log("Dialog", f"{conv['username']} ({conv['status']})", d_created)

    def _log(self, entity, name, created):
        if created:
            self.stdout.write(self.style.SUCCESS(f"  + {entity}: {name}"))
        else:
            self.stdout.write(f"  = {entity}: {name} (exists)")
