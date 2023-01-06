# Generated by Django 3.0.1 on 2023-01-06 01:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_auto_20230105_1546'),
    ]

    operations = [
        migrations.AlterField(
            model_name='artifact',
            name='type',
            field=models.CharField(choices=[('MULTIESPECTRAL', 'Multiespectral'), ('SHAPEFILE', 'Shapefile'), ('INDEX', 'Index'), ('MODEL', 'Model'), ('RGB', 'Rgb'), ('KML', 'Kml')], max_length=20),
        ),
    ]
