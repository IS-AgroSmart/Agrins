# Generated by Django 3.0.1 on 2023-01-05 20:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_layer_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='artifact',
            name='camera',
            field=models.CharField(choices=[('REDEDGE', 'Micasense RedEdge-M'), ('PARROT', 'Parrot Sequoia'), ('VECTOR', 'Vector'), ('NONE', 'none')], max_length=20),
        ),
    ]
