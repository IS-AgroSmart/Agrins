# Generated by Django 3.0.1 on 2022-12-30 02:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='artifact',
            name='camera',
            field=models.CharField(choices=[('REDEDGE', 'Micasense RedEdge'), ('PARROT', 'Parrot Sequoia')], default=django.utils.timezone.now, max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='artifact',
            name='date',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='artifact',
            name='type',
            field=models.CharField(choices=[('MULTIESPECTRAL', 'Multiespectral'), ('SHAPEFILE', 'Shapefile'), ('INDEX', 'Index'), ('RGB', 'Rgb'), ('KML', 'Kml')], max_length=20),
        ),
        migrations.AlterField(
            model_name='userproject',
            name='deleted',
            field=models.BooleanField(default=True),
        ),
    ]
