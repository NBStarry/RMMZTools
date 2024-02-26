# For Windows Now
# TODO: 为每种素材增加高亮动画
import os
from tkinter import Tk, Label, Entry, Button, filedialog, messagebox, OptionMenu, StringVar

from Tile import Tile, TileSet

class TilePackApp:
    def __init__(self, root):
        root.title('素材拼接')
        Label(root, text='源目录：').grid(row=0, column=0)
        source_entry = Entry(root, width=50)
        source_entry.grid(row=0, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_folder(source_entry)
               ).grid(row=0, column=2)
        read_button = Button(root, 
                             text='读取', 
                             command=lambda: self.images_2_tileset(source_entry.get())
                            )
        read_button.grid(row=0, column=3)

        Label(root, text='目标目录：').grid(row=1, column=0)
        dest_entry = Entry(root, width=50)
        dest_entry.grid(row=1, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_folder(dest_entry)
               ).grid(row=1, column=2)

        Label(root, text='闪光文件：').grid(row=2, column=0)
        shine_entry = Entry(root, width=50)
        shine_entry.grid(row=2, column=1)
        Button(root, 
               text='浏览...', 
               command=lambda: self.browse_file(shine_entry)
               ).grid(row=2, column=2)

        Label(root, text='图片名称：').grid(row=3, column=0)
        output_entry = Entry(root, width=50)
        output_entry.grid(row=3, column=1)

        # 图片尺寸下拉菜单
        # Label(root, text='图片尺寸：').grid(row=3, column=0)
        # self.size_var = StringVar(root)
        # self.size_var.set('768x768')  # 设置默认值
        # size_options = ['768x768', '576x384']  # 可选尺寸列表
        # self.size_menu = OptionMenu(root, self.size_var, *size_options)
        # self.size_menu.grid(row=3, column=1)

        # 处理按钮
        pack_all_button = Button(root, 
                                 text='拼人物图', 
                                 command=lambda: 
                                    self.pack_character_images(
                                        dest_entry.get(), 
                                        output_entry.get())
                                )
        pack_all_button.grid(row=4, column=1)
        pack_all_button = Button(root, 
                                 text='拼闪光人物图', 
                                 command=lambda: 
                                    self.pack_shine_character_images(
                                        dest_entry.get(), 
                                        output_entry.get(), 
                                        shine_entry.get())
                                )
        pack_all_button.grid(row=4, column=2)
        # pack_category_button = Button(root, text='按类别拼图', command=lambda: self.pack_images_by_category(dest_entry.get(), output_entry.get()))
        # pack_category_button.grid(row=4, column=2)

        self.root = root
        self.tileset = TileSet()

    def browse_folder(self, entry):
        folder_selected = filedialog.askdirectory()
        entry.delete(0, 'end')
        entry.insert(0, folder_selected)

    def browse_file(self, entry):
        # 使用filedialog.askopenfilename()来获取文件
        file_path = filedialog.askopenfilename()
        entry.delete(0, 'end')  # 清空entry
        entry.insert(0, file_path)  # 插入新的文件路径

    def images_2_tileset(self, source_dir):
        # 读取图片
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.png'):
                    dir = os.path.join(root, file)
                    name = dir.split('\\')[-2]
                    category = name.split('-')[0]
                    x, y = int(name.split('-')[1][0]), int(name.split('-')[1][1])
                    tile = Tile(dir, name, category, x, y)
                    self.tileset.add_tile(tile)
        messagebox.showinfo("完成", 
                            "图片读取完成, 共读取了{}类，{}张图片".format(
                                len(self.tileset.tiles), 
                                self.tileset.tile_count)
                            )

    def pack_character_images(self, dest_dir, output_name):
        # size = tuple(map(int, self.size_var.get().split('x')))
        size = (576, 384)
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
         
        self.tileset.pack_character(dest_dir, output_name, size)
        self.tileset.clear()
        messagebox.showinfo("完成", "拼接人物图完成！")
    
    def pack_shine_character_images(self, dest_dir, output_name, shine_file):
        # size = tuple(map(int, self.size_var.get().split('x')))
        size = (576, 384)
        if not output_name:
            messagebox.showwarning("警告", "请输入输出文件名。")
            return
         
        self.tileset.pack_shine_character(dest_dir, output_name, shine_file, size)
        self.tileset.clear()
        messagebox.showinfo("完成", "拼接人物图完成！")

    # def pack_images_by_category(self, dest_dir, suffix):
    #     # 拼接图片 
    #     self.tileset.pack_by_category(dest_dir, suffix)
    #     self.tileset.clear()
    #     messagebox.showinfo("完成", "按类别拼接图片完成！")

# 创建主窗口
root = Tk()
app = TilePackApp(root)
# 运行主循环
root.mainloop()