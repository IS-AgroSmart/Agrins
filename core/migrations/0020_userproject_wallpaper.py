# Generated by Django 3.0.1 on 2023-03-15 08:37

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_auto_20230310_1219'),
    ]

    operations = [
        migrations.AddField(
            model_name='userproject',
            name='wallpaper',
            field=models.CharField(default=django.utils.timezone.now, max_length=250),
            preserve_default=False,
        ),
    ]
