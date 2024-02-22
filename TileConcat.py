# For Windows Now

import os
from tkinter import Tk, Label, Entry, Button, filedialog, messagebox

from PIL import Image
from rectpack import newPacker, PackingMode, MaxRectsBl, MaxRectsBssf, SORT_LSIDE

PIXEL_PER_CUBE = 48

class Tile:
    def __init__(self, dir, resolution=PIXEL_PER_CUBE):
        '''
        dir:        图片所在目录
        resolution: 期望的图片分辨率，分辨率不同的会被缩放
        name:       图片名称
        category:   图片类别
        x, y:       图片的长宽所占格子数
        img:        图片对象
        '''
        self.dir = dir
        self.name = dir.split('\\')[-2]
        self.category = self.name.split('-')[0]
        self.x, self.y = int(self.name.split('-')[1][0]), int(self.name.split('-')[1][1])
        self.img = Image.open(dir)
        if self.img.mode != 'RGBA':
            self.img = self.img.convert('RGBA')
        self.resize(resolution)
        self.resolution = resolution

    def resize(self, resolution):
        self.img = self.img.resize((self.x * resolution, self.y * resolution), Image.Resampling.LANCZOS)

    def save(self, dest_dir):
        self.img.save(dest_dir)


class TileSet:
    def __init__(self, resolution=PIXEL_PER_CUBE):
        '''
        dir:        图集所在目录
        resolution: 期望的图片分辨率，分辨率不同的会被缩放
        tiles:      图集对象列表
        '''
        self.tiles = {}
        self.tile_count = 0
        self.resolution = resolution

    def add_tile(self, tile):
        if tile.resolution != self.resolution:
            tile.resize(self.resolution)
        if tile.category not in self.tiles:
            self.tiles[tile.category] = [tile]
        else:
            self.tiles[tile.category].append(tile)
        self.tile_count += 1

    def pack(self, dir, name):
        tileset_img = Image.new('RGBA', (768, 768), (255, 255, 255, 0))
        packer = newPacker()
        rid = 0
        for tile_list in self.tiles.values():
            for tile in tile_list:
                packer.add_rect(*tile.img.size, rid)
                rid += 1
        packer.add_bin(768, 768)
        packer.pack()

        rid_to_tile = {}
        rid = 0
        for tile_list in self.tiles.values():
            for tile in tile_list:
                rid_to_tile[rid] = tile
                rid += 1

        # 确保packer返回的是有效的数据
        if not packer.rect_list():
            raise ValueError("拼图失败，图片太多或者图片太大了，无法拼接")
        
        for rect in packer[0]:
            tile = rid_to_tile[rect.rid]
            tileset_img.paste(tile.img, (rect.x, rect.y))
        tileset_img.save(os.path.join(dir, name + '.png'))

    def pack_by_category(self, dir, suffix):
        for category in self.tiles:
            tileset_img = Image.new('RGBA', (576, 384), (255, 255, 255, 0))
            packer = newPacker()

            rid_to_tile = {}
            for rid, tile in enumerate(self.tiles[category]):
                packer.add_rect(*tile.img.size, rid)
                rid_to_tile[rid] = tile
            packer.add_bin(576, 384)
            packer.pack()

            if not packer.rect_list():
                raise ValueError("拼图失败，图片太多或者图片太大了，无法拼接")
            
            for rect in packer[0]:
                tile = self.tiles[category][rect.rid]
                tileset_img.paste(tile.img, (rect.x, rect.y))
            tileset_img.save(os.path.join(dir, category + suffix + '.png'))

class TilePackApp:
    def __init__(self, root):
        root.title('素材拼接')
        Label(root, text='源目录：').grid(row=0, column=0)
        source_entry = Entry(root, width=50)
        source_entry.grid(row=0, column=1)
        Button(root, text='浏览...', command=lambda: self.browse_folder(source_entry)).grid(row=0, column=2)
        read_button = Button(root, text='读取', command=lambda: self.images_2_tileset(source_entry.get()))
        read_button.grid(row=0, column=3)

        Label(root, text='目标目录：').grid(row=1, column=0)
        dest_entry = Entry(root, width=50)
        dest_entry.grid(row=1, column=1)
        Button(root, text='浏览...', command=lambda: self.browse_folder(dest_entry)).grid(row=1, column=2)

        Label(root, text='图片名称：').grid(row=2, column=0)
        output_entry = Entry(root, width=50)
        output_entry.grid(row=2, column=1)

        # 处理按钮
        pack_all_button = Button(root, text='拼大图', command=lambda: self.pack_all_images(dest_entry.get(), output_entry.get()))
        pack_all_button.grid(row=3, column=1)
        pack_category_button = Button(root, text='按类别拼图', command=lambda: self.pack_images_by_category(dest_entry.get(), output_entry.get()))
        pack_category_button.grid(row=3, column=2)

        self.root = root
        self.tileset = TileSet()

    def browse_folder(self, entry):
        folder_selected = filedialog.askdirectory()
        entry.delete(0, 'end')
        entry.insert(0, folder_selected)


    def images_2_tileset(self, source_dir):
        # 读取图片
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.png'):
                    tile = Tile(os.path.join(root, file))
                    self.tileset.add_tile(tile)
        messagebox.showinfo("完成", "图片读取完成, 共读取了{}类，{}张图片".format(len(self.tileset.tiles), self.tileset.tile_count))

    def pack_all_images(self, dest_dir, output_name):
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
         
        self.tileset.pack(dest_dir, output_name)
        messagebox.showinfo("完成", "拼接大图完成！")

    def pack_images_by_category(self, dest_dir, suffix):
        # 拼接图片 
        self.tileset.pack_by_category(dest_dir, suffix)
        messagebox.showinfo("完成", "按类别拼接图片完成！")

# 创建主窗口
root = Tk()
app = TilePackApp(root)
# 运行主循环
root.mainloop()