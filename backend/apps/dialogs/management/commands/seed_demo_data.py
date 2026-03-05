"""Seed realistic demo dialogs, messages, and leads for App Review."""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import InstagramAccount
from apps.dialogs.models import Dialog, Message
from apps.leads.models import Lead


CONVERSATIONS = [
    {
        "username": "maria_wellness",
        "user_id": "90001",
        "status": "lead",
        "temperature": "hot",
        "name": "Maria Santos",
        "phone": "+380 67 123 4567",
        "interest": "Premium Coaching Package",
        "messages": [
            ("user", "Hi! I saw your post about coaching sessions. How much is it?"),
            ("bot", "Hey Maria! Thanks for reaching out! We offer several coaching packages. Are you looking for one-on-one sessions or group coaching?"),
            ("user", "One-on-one for sure. I need personalized approach"),
            ("bot", "Great choice! Our Premium Coaching Package includes 8 one-on-one sessions, personalized action plan, and WhatsApp support between sessions. It's $299/month. Would you like to know more details?"),
            ("user", "Sounds good. What results can I expect?"),
            ("bot", "Our clients typically see significant progress within the first month. We focus on your specific goals and create measurable milestones. Many clients report 2-3x productivity improvement. Would you like to schedule a free discovery call to discuss your goals?"),
            ("user", "Yes! My name is Maria Santos"),
            ("bot", "Nice to meet you, Maria! To schedule your free discovery call, could you share your phone number? Our coach will reach out within 24 hours."),
            ("user", "+380 67 123 4567"),
            ("bot", "Perfect, Maria! I've noted your number. Our coach will call you tomorrow to schedule the discovery session. Looking forward to helping you achieve your goals!"),
        ],
    },
    {
        "username": "alex_fit_coach",
        "user_id": "90002",
        "status": "qualified",
        "temperature": "warm",
        "name": "Alex",
        "phone": "",
        "interest": "Group Training",
        "messages": [
            ("user", "Do you have group training sessions?"),
            ("bot", "Hi there! Yes, we do! Our group training sessions run Monday, Wednesday, and Friday. We have morning (7am) and evening (7pm) slots. Which time works better for you?"),
            ("user", "Evening would be great. How many people in a group?"),
            ("bot", "Our evening groups are small - max 8 people, so you get plenty of attention. The first session is free to try! Would you like to sign up for a trial?"),
            ("user", "Maybe, let me think about it. What's the monthly price?"),
            ("bot", "Of course, take your time! The monthly plan is $89, or you can save with a 3-month package at $229. By the way, what's your name? I'd love to reserve a spot for your trial session."),
            ("user", "I'm Alex. I'll get back to you this week"),
            ("bot", "Sounds great, Alex! No pressure at all. Feel free to message anytime when you're ready. The evening spots fill up fast though, so don't wait too long!"),
        ],
    },
    {
        "username": "sofia.beauty",
        "user_id": "90003",
        "status": "lead",
        "temperature": "hot",
        "name": "Sofia Kovalenko",
        "phone": "+380 50 987 6543",
        "interest": "Facial Treatment",
        "messages": [
            ("user", "Hello! I'd like to book a facial treatment"),
            ("bot", "Hi! Welcome! We'd love to help you with that. We offer several facial treatments: Classic Facial ($49), Deep Cleansing ($79), and our Premium Anti-Aging treatment ($129). Which one interests you?"),
            ("user", "The deep cleansing sounds perfect. Do you have availability this Saturday?"),
            ("bot", "Let me check! We have openings at 10am, 1pm, and 4pm this Saturday. Which time would work best for you?"),
            ("user", "1pm please. My name is Sofia Kovalenko, phone +380 50 987 6543"),
            ("bot", "Wonderful! I've booked you for Deep Cleansing Facial this Saturday at 1pm, Sofia. You'll receive a confirmation shortly. Please arrive 10 minutes early for a quick skin consultation. See you Saturday!"),
        ],
    },
    {
        "username": "techie_dev",
        "user_id": "90004",
        "status": "active",
        "temperature": "cold",
        "name": "",
        "phone": "",
        "interest": "",
        "messages": [
            ("user", "what services do you offer?"),
            ("bot", "Hey! Thanks for your interest! We offer a range of services including coaching, group training, and wellness treatments. What area are you most interested in? I'd love to help you find the right fit!"),
            ("user", "just browsing for now"),
            ("bot", "No problem at all! Feel free to look around and message us anytime. We're always here to help. Is there anything specific you'd like to know about our services?"),
        ],
    },
    {
        "username": "anna_photo",
        "user_id": "90005",
        "status": "lead",
        "temperature": "warm",
        "name": "Anna",
        "phone": "+380 63 555 1234",
        "interest": "Photography Workshop",
        "messages": [
            ("user", "Hi! Is the photography workshop still available?"),
            ("bot", "Hi! Yes, our next Photography Workshop is scheduled for March 15th! It's a full-day intensive covering portrait lighting, composition, and post-processing. The price is $149. Would you like to reserve a spot?"),
            ("user", "Definitely! I'm Anna, can I pay on the day?"),
            ("bot", "Hi Anna! We require a small deposit of $30 to reserve your spot, and the rest can be paid on the day. Could you share your phone number so we can send you the payment details?"),
            ("user", "+380 63 555 1234"),
            ("bot", "Thanks Anna! I'll send the deposit details to your number shortly. Only 3 spots left, so great timing! See you on March 15th!"),
        ],
    },
    {
        "username": "fitness_lover_99",
        "user_id": "90006",
        "status": "handed_off",
        "temperature": "hot",
        "name": "Dmitry Petrov",
        "phone": "+380 95 777 8899",
        "interest": "Personal Training",
        "messages": [
            ("user", "I need a personal trainer. I have a back injury and need someone experienced"),
            ("bot", "I understand your concern completely! Safety is our top priority. Our senior trainer, Coach Viktor, specializes in rehabilitation fitness and has 10 years of experience working with clients recovering from injuries. Would you like me to arrange a consultation with him?"),
            ("user", "Yes please, this is exactly what I need. Dmitry Petrov, +380 95 777 8899"),
            ("bot", "Thank you, Dmitry! Given the specifics of your situation, I'm going to connect you directly with our manager who will coordinate with Coach Viktor for a personal assessment. They'll reach out within a few hours."),
            ("manager", "Hi Dmitry! This is Olena, our wellness coordinator. I've spoken with Coach Viktor and he's available for an initial assessment this Thursday at 5pm. He'll evaluate your condition and create a safe training program. Does that work for you?"),
        ],
    },
    {
        "username": "healthy_eater",
        "user_id": "90007",
        "status": "active",
        "temperature": "warm",
        "name": "Katya",
        "phone": "",
        "interest": "Nutrition Consultation",
        "messages": [
            ("user", "Do you offer nutrition consulting?"),
            ("bot", "Hi! Yes, we do! Our certified nutritionist offers personalized meal plans and consultations. We have two options: a single consultation ($59) or a 4-week nutrition program ($199) with weekly check-ins. Which sounds more interesting?"),
            ("user", "The 4 week program. I'm Katya btw. What does it include exactly?"),
            ("bot", "Nice to meet you, Katya! The 4-week program includes: initial body composition analysis, personalized meal plan based on your goals, weekly 30-min check-in calls, recipe suggestions, and grocery shopping lists. It's our most popular program! Would you like to get started?"),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed demo dialogs, messages, and leads for App Review"

    def handle(self, *args, **options):
        ig_account = InstagramAccount.objects.filter(is_active=True).first()
        if not ig_account:
            self.stderr.write("No active Instagram account found")
            return

        tenant = ig_account.tenant
        now = timezone.now()
        created = 0

        for i, conv in enumerate(CONVERSATIONS):
            # Create dialog with timestamps spread over last few days
            dialog_time = now - timedelta(hours=random.randint(2, 72))
            dialog, _ = Dialog.objects.get_or_create(
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

            if dialog.messages.exists():
                self.stdout.write(f"  Skipping {conv['username']} (already has messages)")
                continue

            dialog.status = conv["status"]
            dialog.instagram_username = conv["username"]
            dialog.is_bot_active = conv["status"] != "handed_off"
            dialog.save()

            # Create messages with progressive timestamps
            msg_time = dialog_time
            for role, text in conv["messages"]:
                Message.objects.create(
                    dialog=dialog,
                    role=role,
                    text=text,
                    created_at=msg_time,
                )
                msg_time += timedelta(minutes=random.randint(1, 15))

            # Create lead if applicable
            if conv["name"] and (conv["phone"] or conv["temperature"] in ("hot", "warm")):
                Lead.objects.get_or_create(
                    dialog=dialog,
                    defaults={
                        "tenant": tenant,
                        "name": conv["name"],
                        "phone": conv["phone"],
                        "interest": conv["interest"],
                        "temperature": conv["temperature"],
                        "manager_notified": conv["temperature"] == "hot",
                    },
                )

            created += 1
            self.stdout.write(f"  Created dialog: {conv['username']} ({conv['status']})")

        self.stdout.write(self.style.SUCCESS(f"Done! Created {created} demo dialogs."))
