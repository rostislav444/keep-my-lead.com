from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_alter_item_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='short_description',
            field=models.CharField(
                blank=True,
                help_text='1-2 sentences for quick catalog overview (always sent to bot)',
                max_length=500,
            ),
        ),
        migrations.AddField(
            model_name='item',
            name='bot_instructions',
            field=models.TextField(
                blank=True,
                help_text='Instructions for the bot: what to emphasize, avoid, which questions to ask',
            ),
        ),
    ]
