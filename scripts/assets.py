"""Create delivery derivatives only; the original supplied PNGs are never modified.
Run with Pillow installed in an isolated tooling environment.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parent.parent
ASSETS=ROOT/'assets'
for stem in ('atencion-dental','dra-maday-pallares'):
    image=ImageOps.exif_transpose(Image.open(ASSETS/(stem+'.png'))).convert('RGB')
    for width in (480,960):
        # Resample the full photograph; CSS retains the existing crop.
        resized=image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS)
        resized.save(ASSETS/f'{stem}-{width}.webp',quality=86,method=6)

font_dir=Path('/System/Library/Fonts/Supplemental')
def font(size,bold=False):
    return ImageFont.truetype(str(font_dir/('Arial Bold.ttf' if bold else 'Arial.ttf')),size)
for language in ('es','en'):
    canvas=Image.new('RGB',(1200,630),'#032459')
    draw=ImageDraw.Draw(canvas)
    portrait=ImageOps.fit(Image.open(ASSETS/'dra-maday-pallares.png').convert('RGB'),(400,500),method=Image.Resampling.LANCZOS,centering=(.5,.45))
    mask=Image.new('L',portrait.size,0);ImageDraw.Draw(mask).rounded_rectangle((0,0,399,499),radius=22,fill=255)
    canvas.paste(portrait,(750,65),mask)
    logo=Image.open(ASSETS/'logo-clinica.png').convert('RGBA');logo.thumbnail((58,58),Image.Resampling.LANCZOS)
    canvas.paste(logo,(54,58),logo)
    draw.text((130,65),'CLÍNICA DENTAL',font=font(23,True),fill='#ffffff')
    draw.text((54,180),'Dra. Maday',font=font(61,True),fill='white')
    draw.text((54,252),'Pallares González',font=font(61,True),fill='white')
    draw.text((54,367),'Dentista en San Carlos' if language=='es' else 'Dentist in San Carlos',font=font(34),fill='#79c4ed')
    draw.text((54,419),'Alajuela, Costa Rica',font=font(26),fill='#d9edf9')
    draw.line((54,498,660,498),fill='#35577d',width=1)
    draw.text((54,529),'Odontología general y estética' if language=='es' else 'General & cosmetic dentistry',font=font(25),fill='#ffffff')
    canvas.save(ASSETS/f'og-{language}.jpg',quality=90,optimize=True)
print('Responsive WebP photos and 1200×630 social images generated.')
