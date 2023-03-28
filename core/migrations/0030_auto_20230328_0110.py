# Generated by Django 3.0.1 on 2023-03-28 06:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0029_contact_meta'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='maximum_space',
            field=models.PositiveIntegerField(default=10485760),
        ),
        migrations.AlterField(
            model_name='user',
            name='type',
            field=models.CharField(choices=[('DEMO_USER', 'DemoUser'), ('ACTIVE', 'Active'), ('ADVANCED', 'Advanced'), ('DELETED', 'Deleted'), ('ADMIN', 'Admin')], default='ACTIVE', max_length=20),
        ),
    ]