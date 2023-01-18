<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="2.6.1-Brighton" minimumScale="-4.65661e-10" maximumScale="1e+08" hasScaleBasedVisibilityFlag="0">
  <pipe>
    <rasterrenderer opacity="1" alphaBand="0" classificationMax="0.956" classificationMinMaxOrigin="CumulativeCutFullExtentEstimated" band="1" classificationMin="0.239" type="singlebandpseudocolor">
      <rasterTransparency/>
      <rastershader>
        <colorrampshader colorRampType="INTERPOLATED" clip="0">
          <item alpha="255" value="-1" label="-1" color="#ffffff"/>
          <item alpha="255" value="0" label="&lt; 0.1" color="#000000"/>
          <item alpha="255" value="0.1" label="0.1 - 0.19" color="#817ae2"/>
          <item alpha="255" value="0.2" label="0.20 - 0.59" color="#07ff01"/>
          <item alpha="255" value="0.6" label="0.60 - 0.79" color="#fff802"/>
          <item alpha="255" value="0.8" label="0.8 - 0.89" color="#fe2401"/>
          <item alpha="255" value="1" label="> 0.90" color="#ff00cf"/>
        </colorrampshader>
      </rastershader>
    </rasterrenderer>
    <brightnesscontrast brightness="0" contrast="0"/>
    <huesaturation colorizeGreen="128" colorizeOn="0" colorizeRed="255" colorizeBlue="128" grayscaleMode="0" saturation="0" colorizeStrength="100"/>
    <rasterresampler maxOversampling="2"/>
  </pipe>
  <blendMode>0</blendMode>
</qgis>